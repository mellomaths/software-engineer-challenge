import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RedisService } from '../../../infrastructure/redis/services/redis/redis.service';
import { UserPriorityEntity } from '../entities/user-priority.entity';
import { UserEntity } from '../entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  let createQueryBuilder: jest.Mock;
  let queryBuilder = {
    leftJoinAndSelect: jest.fn(),
    orderBy: jest.fn(),
    take: jest.fn(),
    skip: jest.fn(),
    where: jest.fn(),
    getMany: jest.fn(),
  };
  let get: jest.Mock;
  let set: jest.Mock;

  beforeEach(async () => {
    createQueryBuilder = jest.fn();
    createQueryBuilder.mockReturnValueOnce(queryBuilder);
    queryBuilder.leftJoinAndSelect.mockReturnValue(queryBuilder);
    queryBuilder.orderBy.mockReturnValue(queryBuilder);
    queryBuilder.take.mockReturnValue(queryBuilder);
    queryBuilder.skip.mockReturnValue(queryBuilder);
    queryBuilder.where.mockReturnValueOnce(queryBuilder);
    get = jest.fn();
    set = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            createQueryBuilder,
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
    let users: UserEntity[] = [];
    let usersCount: number;
    let devUsers: number;
    const randomUsers = 20;
    // Pushing a priority 2 before priority 1 to test sorting logic
    users.push(createUser('Software Engineer', 'dev.software.engineer', 2));
    users.push(createUser('Data Scientist', 'dev.data.scientist', 1));
    // Adding a user that does not a have a priority
    users.push(createUser('Solution Architect', 'dev.solution.architect', 3));
    users.push(createUser('Support Analyst', 'dev.support.analyst', 1));
    users.push(createUser('Quality Assurance Analyst', 'dev.quality.assurance.analyst', 2));
    // Create first the dev users to test the response searching by keyword
    devUsers = users.length;
    for (let i = 0; i < randomUsers; i++) {
      users.push(createUser(
        getRandomUserFullname(), 
        getRandomUserUsername(), 
        getRandomIntInclusive(1, 3)
      ));
    }

    usersCount = users.length;

    beforeEach(() => {
      // Making a copy of users generated collection
      queryBuilder.getMany.mockReturnValue(users.slice());
      queryBuilder.where.mockReset();
      set.mockReturnValue(null);
    });

    it('should find all users from database without searching by a keyword', async () => {
      get.mockReturnValue(null);
      const serviceResponse = await service.findUsers({ search: 'test' });
      expect(serviceResponse.status).toEqual(200);
      expect(serviceResponse.errors.length).toEqual(0);
      expect(serviceResponse.description).toEqual('OK.');
      expect(serviceResponse.payload).toBeDefined();
      expect(serviceResponse.payload.pagination).toBeDefined();
      expect(serviceResponse.payload.pagination.start).toEqual(0);
      expect(serviceResponse.payload.pagination.limit).toEqual(100);
      expect(serviceResponse.payload.pagination.count).toEqual(usersCount);
      expect(serviceResponse.payload.result).toBeDefined();
      expect(serviceResponse.payload.result.length).toEqual(usersCount);
      
      const usersFound = serviceResponse.payload.result;
      expect(usersFound[0].priority).toBeDefined();
      expect(usersFound[0].priority.priority_num).toEqual(1);
      expect(usersFound[usersCount-1].priority).toBeNull();

      // Expect to not use the where clause so that it brings any value
      expect(queryBuilder.where).toHaveBeenCalled();
    });

    it('should find users by searching a keyword', async () => {
      // Returning the first static users inserted
      queryBuilder.getMany.mockReturnValue(users.slice(0, devUsers));
      get.mockReturnValue(null);
      const query = { search: 'dev' };
      const serviceResponse = await service.findUsers(query);
      expect(serviceResponse.status).toEqual(200);
      expect(serviceResponse.errors.length).toEqual(0);
      expect(serviceResponse.description).toEqual('OK.');
      expect(serviceResponse.payload).toBeDefined();
      expect(serviceResponse.payload.pagination).toBeDefined();
      expect(serviceResponse.payload.pagination.start).toEqual(0);
      expect(serviceResponse.payload.pagination.limit).toEqual(100);
      expect(serviceResponse.payload.pagination.count).toEqual(5);
      expect(serviceResponse.payload.result).toBeDefined();
      expect(serviceResponse.payload.result.length).toEqual(5);

      const usersFound = serviceResponse.payload.result;
      expect(usersFound[0].username).toContain('dev');
      expect(usersFound[1].username).toContain('dev');

      // First should have priority 1
      expect(usersFound[0].priority).toBeDefined();
      expect(usersFound[0].priority.priority_num).toEqual(1);

      // Second last should have a priority 2
      expect(usersFound[devUsers-2].priority).toBeDefined();
      expect(usersFound[devUsers-2].priority.priority_num).toEqual(2);

      // Last should not have a priority defined
      expect(usersFound[devUsers-1].priority).toBeNull();

      // Expect to use the where clause to search for the keyword
      expect(queryBuilder.where).toHaveBeenCalled();
    });

    it('should find users from database using pagination', async () => {
      const query = { search: 'test', start: 5, limit: 5 };
      queryBuilder.getMany.mockReturnValue(users.slice(query.start, query.limit + query.start));
      get.mockReturnValue(null);
      const serviceResponse = await service.findUsers(query);
      expect(serviceResponse.status).toEqual(200);
      expect(serviceResponse.errors.length).toEqual(0);
      expect(serviceResponse.description).toEqual('OK.');
      expect(serviceResponse.payload).toBeDefined();
      expect(serviceResponse.payload.pagination).toBeDefined();
      expect(serviceResponse.payload.pagination.start).toEqual(query.start);
      expect(serviceResponse.payload.pagination.limit).toEqual(query.limit);
      expect(serviceResponse.payload.pagination.count).toEqual(query.limit);
      expect(serviceResponse.payload.result).toBeDefined();
      expect(serviceResponse.payload.result.length).toEqual(query.limit);
      
      const usersFound = serviceResponse.payload.result;
      expect(usersFound[0].priority).toBeDefined();
      expect(usersFound[0].priority.priority_num).toEqual(1);

      // Expect to not use the where clause so that it brings any value
      expect(queryBuilder.where).toHaveBeenCalled();
    });
    
    it('should find users cached', async () => {
      get.mockReturnValue(users.slice());
      const serviceResponse = await service.findUsers({ search: 'test' });
      expect(serviceResponse.status).toEqual(200);
      expect(serviceResponse.errors.length).toEqual(0);
      expect(serviceResponse.description).toEqual('Cached.');
      expect(serviceResponse.payload).toBeDefined();
      expect(serviceResponse.payload.pagination).toBeDefined();
      expect(serviceResponse.payload.pagination.start).toEqual(0);
      expect(serviceResponse.payload.pagination.limit).toEqual(100);
      expect(serviceResponse.payload.pagination.count).toEqual(usersCount);
      expect(serviceResponse.payload.result).toBeDefined();
      expect(serviceResponse.payload.result.length).toEqual(usersCount);

      expect(createQueryBuilder).not.toHaveBeenCalled();
    });
  });
});


function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomUserFullname(): string {
  return 'Test ' + new Date().getTime();
}

function getRandomUserUsername(): string {
  return 'test' + new Date().getTime() + '@email.com';
}

function createUser(fullname: string, username: string, priority: number): UserEntity {
  const user = new UserEntity();
  user.id = getRandomIntInclusive(1000, 1000000);
  user.fullname = fullname;
  user.username = username;
  user.priority = null;
  if (priority < 3) {
    user.priority = new UserPriorityEntity();
    user.priority.user_id = user.id;
    user.priority.priority_num = priority;
  }
  return user;
}
