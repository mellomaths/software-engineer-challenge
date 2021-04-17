import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceResponse } from 'src/utils/service.response';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

export interface FindUsersQuery {
  search: string;
  limit: number;
  start: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private cacheKey = {
    of: {
      findUsers: (query: FindUsersQuery) => {
        const search = query.search ? query.search : ''; 
        return `findUsers.${search.replace(' ', '-')}.${query.start}.${query.limit}`;
      }
    }
  };

  async findUsers({ search, start=0, limit=100 }: FindUsersQuery): Promise<ServiceResponse> {
    const query = {
      search: search.toLowerCase(),
      start,
      limit
    }; 

    const cacheKey = this.cacheKey.of.findUsers(query);
    let users: UserEntity[] = await this.cacheManager.get(cacheKey);
    if (users) {
      return { status: 206, payload: { users }, errors: [], description: 'OK' }; 
    }

    const options: FindManyOptions = {
      take: limit,
      skip: start,
    };

    if (query.search) {
      options.where = [
        { fullname: Like(`%${query.search}%`) },
        { username: Like(`%${query.search}%`) },
      ];
    }

    users = await this.usersRepository.find(options);

    users = users.sort((userA, userB) =>
      userA.getPriorityNumber() > userB.getPriorityNumber() ? 1 : -1,
    );

    this.cacheManager.set(cacheKey, users);
    return { status: 206, payload: { pagination: { start, limit }, result: users }, errors: [], description: 'OK' };
  }
}
