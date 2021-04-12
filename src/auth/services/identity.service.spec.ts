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

    beforeEach(() => {
      client = new ClientEntity();
      client.generateId();
      create.mockImplementation((data) => ({ id: client.id, ...data }));
      save.mockReturnValue(undefined);
      findOne.mockReturnValue(null);
    });

    it('should create client', async () => {
      // const result = { id: '3640e092-687b-4916-a050-52b4e6108300', username: 'TEST_USER', password: '12345678' };
      const clientRequest = { username: 'TEST_USER', password: '12345678' };
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
  });
});
