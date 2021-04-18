import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RedisService } from '../../../infrastructure/redis/services/redis/redis.service';
import { UserPriorityEntity } from '../entities/user-priority.entity';
import { UserEntity } from '../entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  let find: jest.Mock;
  let get: jest.Mock;
  let set: jest.Mock;

  beforeEach(async () => {
    find = jest.fn();
    get = jest.fn();
    set = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            find,
          },
        },
        {
          provide: getRepositoryToken(UserPriorityEntity),
          useValue: {
            find,
          },
        },
        {
          provide: RedisService,
          useValue: {
            get,
            set
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
