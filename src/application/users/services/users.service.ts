import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceResponse } from 'src/utils/service.response';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { RedisService } from '../../../infrastructure/redis/services/redis/redis.service';

export interface FindUsersQuery {
  search?: string;
  limit?: number;
  start?: number;
}

@Injectable()
export class UsersService {

  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly cacheManager: RedisService,
  ) {}

  private cacheKey = {
    of: {
      findUsers: (query: FindUsersQuery) => {
        const search = query.search ? query.search : '';
        return `findUsers.${search.replace(' ', '-')}.${query.start}.${
          query.limit
        }`;
      },
    },
  };

  async findUsers({
    search = '',
    start = 0,
    limit = 100,
  }: FindUsersQuery = {}): Promise<ServiceResponse> {
    const query = {
      search: search.toLowerCase(),
      start: parseInt(start.toString()),
      limit: parseInt(limit.toString()),
    };
    this.logger.log(`findUsers:: Searching for users using parameters: ${JSON.stringify(query)}`);
    this.logger.log(`findUsers:: Checking if the payload is saved in cache.`);

    const cacheKey = this.cacheKey.of.findUsers(query);
    this.logger.log(`findUsers:: Cache Key: ${cacheKey}`);
    let users: UserEntity[] = await this.cacheManager.get(cacheKey);
    if (users) {
      this.logger.log(`findUsers:: Cache hit.`);
      this.logger.log(`findUsers:: Users found using cache.`);
      return {
        status: 206,
        payload: {
          pagination: { start: query.start, limit: query.limit, count: users.length },
          result: users,
        },
        errors: [],
        description: 'OK',
      };
    }

    this.logger.log(`findUsers:: Users searched was not found at cache, searching now the database.`);
    this.logger.log(`findUsers:: Building query for the database.`);
    const options: FindManyOptions = {
      take: query.limit,
      skip: query.start,
    };

    if (query.search) {
      options.where = [
        { fullname: Like(`%${query.search}%`) },
        { username: Like(`%${query.search}%`) },
      ];
    }

    this.logger.log(`findUsers:: Query built: ${JSON.stringify(options)}`);

    users = await this.usersRepository.find(options);
    this.logger.log(`findUsers:: Count of users returned from the database: ${users.length}.`);

    this.logger.log(`findUsers:: Sorting the users by priority.`);
    users = users.sort((userA, userB) =>
      // Ascending order
      // if the user doesn't have a priority number
      //  the getPriorityNumber() method returns INFINITY
      userA.getPriorityNumber() > userB.getPriorityNumber() ? 1 : -1,
    );

    this.logger.log(`findUsers:: Users sorted.`);
    this.logger.log(`findUsers:: Saving users at cache.`);
    this.logger.log(`findUsers:: Cache Key: ${cacheKey}`);
    this.cacheManager.set(cacheKey, users);
    this.logger.log(`findUsers:: Returning users partial content from the database.`);
    return {
      status: 206,
      payload: {
        pagination: { start: query.start, limit: query.limit, count: users.length },
        result: users,
      },
      errors: [],
      description: 'OK',
    };
  }
}
