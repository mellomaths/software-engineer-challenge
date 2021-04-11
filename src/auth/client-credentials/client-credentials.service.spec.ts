import { Test, TestingModule } from '@nestjs/testing';
import { ClientCredentialsService } from './client-credentials.service';

describe('ClientCredentialsService', () => {
  let service: ClientCredentialsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientCredentialsService],
    }).compile();

    service = module.get<ClientCredentialsService>(ClientCredentialsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
