import { Injectable } from '@nestjs/common';

export type Client = any;

@Injectable()
export class ClientCredentialsService {
  private readonly clients = [
    {
      id: 'fba0be35-7111-43c5-8111-b326360da4d0',
      secret: '7354ff5e-cc72-4cc7-a8d0-279f3349c52b',
    },
    {
      id: '4096545a-3d93-476d-9a25-ae486a12a720',
      secret: 'c9a749fb-2213-47a7-b56d-ebcad7f02bdf',
    },
  ];

  async findById(id: string): Promise<Client | undefined> {
    return this.clients.find((client) => client.id === id);
  }
}
