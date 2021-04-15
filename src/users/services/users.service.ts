import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceResponse } from 'src/utils/service.response';
import { Like, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private cacheKey = {
    of: {
      findUsersByKeyword: (keyword: string) => {
        const search = keyword ? keyword : ''; 
        return `findUsersByKeyword.${search.replace(' ', '-')}`;
      }
    }
  };

  async findUsersByKeyword(keyword: string): Promise<ServiceResponse> {
    if (!keyword) {
      return {
        status: 400,
        payload: {},
        errors: [],
        description: 'A search parameter is required for finding users.',
      };
    }

    const cacheKey = this.cacheKey.of.findUsersByKeyword(keyword);
    let users: UserEntity[] = await this.cacheManager.get(cacheKey);
    if (users) {
      return { status: 200, payload: { users }, errors: [], description: 'OK' }; 
    }

    users = await this.usersRepository.find({
      where: [
        { fullname: Like(`%${keyword}%`) },
        { username: Like(`%${keyword}%`) },
      ],
    });

    users = users.sort((userA, userB) =>
      userA.getPriorityNumber() > userB.getPriorityNumber() ? 1 : -1,
    );

    this.cacheManager.set(cacheKey, users);
    return { status: 200, payload: { users }, errors: [], description: 'OK' };
  }
}
