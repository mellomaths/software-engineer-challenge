import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceResponse } from 'src/utils/service.response';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { RedisService } from '../../../infrastructure/redis/services/redis/redis.service';

export interface FindUsersParams {
  search: string;
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
      findUsers: (params: FindUsersParams) => {
        const search = params.search ? params.search : '';
        return `findUsers.${search.replace(' ', '-')}.${params.start}.${
          params.limit
        }`;
      },
    },
  };

  async findUsers({
    search = '',
    start = 0,
    limit = 100,
  }: FindUsersParams = { search: '' }): Promise<ServiceResponse> {
    const params = {
      search: search,
      start: parseInt(start.toString()),
      limit: parseInt(limit.toString()),
    };
    this.logger.log(`findUsers:: Searching for users using parameters: ${JSON.stringify(params)}`);
    if (!params.search) {
      this.logger.log(`findUsers:: The parameter 'search' for searching by a keyword was not sent.`);
      const response: ServiceResponse = { 
        status: 400,
        payload: {}, 
        errors: [], 
        description: 
          "The query parameter 'search' is required for this request. You should provide at least a keyword to search for.", 
      };
      this.logger.log(`findUsers:: Returning response: ${response}`);
      return response;
    }

    this.logger.log(`findUsers:: Checking if the payload is saved in cache.`);
    const cacheKey = this.cacheKey.of.findUsers(params);
    this.logger.log(`findUsers:: Cache Key: ${cacheKey}`);
    let users: UserEntity[] = await this.cacheManager.get(cacheKey);
    if (users) {
      this.logger.log(`findUsers:: Cache hit.`);
      this.logger.log(`findUsers:: Users found using cache.`);
      return {
        status: 200,
        payload: {
          pagination: { start: params.start, limit: params.limit, count: users.length },
          result: users,
        },
        errors: [],
        description: 'Cached.',
      };
    }

    this.logger.log(`findUsers:: Users searched was not found at cache, searching now the database.`);
    this.logger.log(`findUsers:: Building query for the database.`);
    const query = this.usersRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.priority', 'priority', "priority.user_id = users.id")
      .take(params.limit)
      .skip(params.start)
      .orderBy({
        'priority.priority_num': 'ASC'
      });

    if (params.search) {
      query
        .where(
          `users.fullname LIKE :fullname`, 
          { fullname: `%${params.search}%` }
        )
        .orWhere(
          `users.username LIKE :username`, 
          { username: `%${params.search}%` }
        );
    }

    users = await query.getMany();
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
      status: 200,
      payload: {
        pagination: { start: params.start, limit: params.limit, count: users.length },
        result: users,
      },
      errors: [],
      description: 'OK.',
    };
  }
}
