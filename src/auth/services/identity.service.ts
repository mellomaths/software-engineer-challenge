import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcryptjs';

import { ClientEntity } from '../entities/client.entity';
import { ClientDto } from '../dto/client.dto';
import { ServiceError, ServiceResponse, ServiceValidationResponse } from 'src/utils/service.response';

@Injectable()
export class IdentityService {

  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
  ) { }

  private async hashPassword(password: string): Promise<string> {
    const salt: string = await bcrypt.genSalt(10);
    const hash: string = await bcrypt.hash(password, salt);
    return hash;
  }

  private async comparePassword(password: string, attempt: string): Promise<boolean> {
    return bcrypt.compare(attempt, password);
  }

  async checkLoginAttempt(username: string, attempt: string): Promise<ServiceResponse> {
    const client: ClientEntity = await this.findOne(username);
    if (!client) {
      const description: string = `Client ${username} was not found.`;
      return { status: 404, payload: {}, errors: [], description };
    }

    const passwordMatched: boolean = await this.comparePassword(client.password, attempt);
    if (!passwordMatched) {
      const description: string = `Bad password`;
      return { status: 401, payload: {}, errors: [], description };
    }

    return {
      status: 200,
      payload: {
        client: {
          ...client,
          password: undefined
        }
      },
      errors: [],
      description: 'OK',
    };
  }

  async findOne(username: string): Promise<ClientEntity | null> {
    const client: ClientEntity = await this.clientRepository.findOne({ where: { username } });
    if (!client) {
      return null;
    }

    return client;
  }

  async validate(client: ClientDto): Promise<ServiceValidationResponse> {
    let isOk = true;
    const errors: ServiceError[] = [];

    const existingClient: ClientEntity = await this.clientRepository.findOne({ where: { username: client.username } });
    if (existingClient) {
      isOk = false;
      errors.push({ code: 'CONFLICT', field: 'username', message: 'Username registered.' });
    }

    return { isOk, errors };
  }

  async create(data: ClientDto): Promise<ServiceResponse> {
    const validation =  await this.validate(data);
    if (!validation.isOk) {
      return { status: 422, errors: validation.errors, payload: {}, description: 'Server was not able to register this client.' };
    }

    const hash = await this.hashPassword(data.password);
    const client: ClientEntity = this.clientRepository.create({ ...data, password: hash });
    await this.clientRepository.save(client);

    const { password, ...result } = client;
    return { status: 201, payload: { client: result }, errors: [], description: 'Client successfully created.' };
  }

}
