import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RedisService } from '../../../infrastructure/redis/services/redis/redis.service';
import { UserPriorityEntity } from '../entities/user-priority.entity';
import { UserEntity } from '../entities/user.entity';
import { UsersService } from './users.service';

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

  describe('findUsers', () => {
    let users: UserEntity[];
    let usersCount: number;

    beforeEach(() => {
      usersCount = 20;
      users = [];
      for (let i = 0; i < usersCount; i++) {
        const user = new UserEntity();
        user.id = String(i);
        user.fullname = 'Test ' + new Date().getTime();
        user.username = 'test' + new Date().getTime() + '@email.com';
        user.priority = null;
        const priority = getRandomIntInclusive(1, 3);
        if (priority < 3) {
          user.priority = new UserPriorityEntity();
          user.priority.user_id = String(i);
          user.priority.priority_num = priority;
        }
        users.push(user);
      }
      
      find.mockReturnValue(users);
      set.mockReturnValue(null);
    });

    it('should find all users from database without searching by a keyword', async () => {
      get.mockReturnValue(null);
      const query = { search: '', start: 0, limit: usersCount+1 };
      const serviceResponse = await service.findUsers(query);
      expect(serviceResponse.status).toEqual(206);
      expect(serviceResponse.errors.length).toEqual(0);
      expect(serviceResponse.description).toEqual('OK');
      expect(serviceResponse.payload).toBeDefined();
      expect(serviceResponse.payload.pagination).toBeDefined();
      expect(serviceResponse.payload.pagination.start).toEqual(query.start);
      expect(serviceResponse.payload.pagination.limit).toEqual(query.limit);
      expect(serviceResponse.payload.pagination.count).toEqual(usersCount);
      expect(serviceResponse.payload.result).toBeDefined();
      expect(serviceResponse.payload.result.length).toEqual(usersCount);
    });
  });

});
