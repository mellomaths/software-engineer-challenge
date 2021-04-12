import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientEntity } from '../entities/client.entity';
import { IdentityService } from './identity.service';

describe('IdentityService', () => {
  let service: IdentityService;

  let create: jest.Mock;
  let save: jest.Mock;
  let findOne: jest.Mock;

  beforeEach(async () => {
    create = jest.fn();
    save = jest.fn();
    findOne = jest.fn();
    const module = await Test.createTestingModule({
      providers: [
        IdentityService,
        {
          provide: getRepositoryToken(ClientEntity),
          useValue: {
            create,
            save,
            findOne,
          },
        },
      ],
    }).compile();

    service = module.get<IdentityService>(IdentityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    let client: ClientEntity;
    let clientRequest = { username: 'TEST_USER', password: '12345678' };

    beforeEach(() => {
      client = new ClientEntity();
      client.generateId();
      create.mockImplementation((data) => ({ id: client.id, ...data }));
      save.mockReturnValue(undefined);
    });

    it('should create client', async () => {
      findOne.mockReturnValue(null);

      const serviceResponse = await service.create(clientRequest);
      expect(serviceResponse.status).toEqual(201);
      expect(serviceResponse.description).toEqual(
        'Client successfully created.',
      );
      expect(serviceResponse.payload.client).toBeDefined();
      expect(serviceResponse.payload.client.id).toBeDefined();
      expect(serviceResponse.payload.client.password).toBeUndefined();
      expect(serviceResponse.payload.client.username).toEqual('TEST_USER');
    });

    it('should validate user already exists', async () => {
      findOne.mockReturnValue(client);

      const serviceResponse = await service.create(clientRequest);
      expect(serviceResponse.status).toEqual(422);
      expect(serviceResponse.description).toEqual('Server was not able to register this client.');
      expect(serviceResponse.errors).toContainEqual({ code: 'CONFLICT', field: 'username', message: 'Username registered.' })
    });
  });

  describe('findById', () => {
    let client: ClientEntity;

    beforeEach(() => {
      client = new ClientEntity();
      client.generateId();
      client.username = 'TEST_USER';
      client.password = '12345678';
      findOne.mockReturnValue(client);
    });

    it('should find a client by id', async () => {
      const serviceResponse = await service.findById(client.id);
      expect(serviceResponse.status).toEqual(200);
      expect(serviceResponse.description).toEqual('OK');
      expect(serviceResponse.payload.client).toBeDefined();
      expect(serviceResponse.payload.client.id).toBeDefined();
      expect(serviceResponse.payload.client.password).toBeUndefined();
      expect(serviceResponse.payload.client.username).toEqual('TEST_USER');
    });
  });

});
