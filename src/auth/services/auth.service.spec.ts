import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockedBcryptService } from '../../../test/mocks/bcrypt.service';
import { mockedConfigService } from '../../../test/mocks/config.service';
import { mockedJwtService } from '../../../test/mocks/jwt.service';
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

  describe('validate', () => {
    let client: ClientEntity;
    let attempt = '12345678';

    beforeEach(() => {
      client = new ClientEntity();
      client.generateId();
      client.username = 'TEST_USER';
      client.password = mockedBcryptService.hash();
    });

    it('should validate a client with correct password attempt', async () => {
      findOne.mockReturnValue(client);

      const serviceResponse = await service.validate(
        client.username,
        attempt,
      );
      expect(serviceResponse).toBeDefined();
      expect(serviceResponse.id).toBeDefined();
      expect(serviceResponse.username).toBeDefined();
    });

    it('should validate against bad password', async () => {
      findOne.mockReturnValue(client);

      const serviceResponse = await service.validate(
        client.username,
        '1234',
      );
      expect(serviceResponse).toBeNull();
    });

    it('should validate against a not existing client', async () => {
      findOne.mockReturnValue(null);

      const serviceResponse = await service.validate(
        client.username,
        '12345678',
      );
      expect(serviceResponse).toBeNull();
    });
  });
});
