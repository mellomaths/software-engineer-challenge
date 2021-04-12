import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientEntity } from '../entities/client.entity';

import { AuthService } from './auth.service';
import { IdentityService } from './identity.service';

const mockedConfigService = {
  get(key: string) {
    switch (key) {
      case 'auth.jwt.secret':
        return 'NDgzMDE2MDIzNDQwNjIxNjE4.DmNiFQ.C9hWQsCEJoW5Y9mT5oatUjSLKlw';
      case 'auth.jwt.expirationTime':
        return 3600;
    }
  },
};

const mockedJwtService = {
  sign: () =>
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc3Y2Q4N2M5LTA3YmYtNGE1Mi1hYTA5LTBiNjZiNjBkZTBmYiIsInVzZXJuYW1lIjoibWVsbG9tYXRocyIsInN1YiI6Ijc3Y2Q4N2M5LTA3YmYtNGE1Mi1hYTA5LTBiNjZiNjBkZTBmYiIsImlhdCI6MTYxODIwMTQyOSwiZXhwIjoxNjE4MjA1MDI5fQ.Zc8-SP3qD9tSH_pWYbqWcL0l8TzF6l0CtdLOpE_CYGA',
};

describe('AuthService', () => {
  let service: AuthService;

  let create: jest.Mock;
  let save: jest.Mock;
  let findOne: jest.Mock;

  beforeEach(async () => {
    create = jest.fn();
    save = jest.fn();
    findOne = jest.fn();
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        IdentityService,
        {
          provide: getRepositoryToken(ClientEntity),
          useValue: {
            create,
            save,
            findOne,
          },
        },
        {
          provide: ConfigService,
          useValue: mockedConfigService,
        },
        {
          provide: JwtService,
          useValue: mockedJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
