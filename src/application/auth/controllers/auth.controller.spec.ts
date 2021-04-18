wimport { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockedJwtService } from '../../../../test/mocks/jwt.service';
import { mockedConfigService } from '../../../../test/mocks/config.service';

import { ClientEntity } from '../entities/client.entity';
import { AuthService } from '../services/auth.service';
import { IdentityService } from '../services/identity.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;

  let create: jest.Mock;
  let save: jest.Mock;
  let findOne: jest.Mock;

  beforeEach(async () => {
    create = jest.fn();
    save = jest.fn();
    findOne = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
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

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
