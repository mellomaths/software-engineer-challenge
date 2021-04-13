import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockedConfigService } from 'test/mocks/config.service';
import { mockedJwtService } from 'test/mocks/jwt.service';
import { ClientEntity } from '../entities/client.entity';

import { AuthService } from './auth.service';
import { IdentityService } from './identity.service';

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
