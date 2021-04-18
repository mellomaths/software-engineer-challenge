import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcryptjs';

import { ClientEntity } from '../entities/client.entity';
import { ClientDto } from '../dto/client.dto';
import { ServiceError, ServiceResponse, ServiceValidationResponse } from 'src/utils/service.response';

@Injectable()
export class IdentityService {

  private readonly logger = new Logger(IdentityService.name);

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
    this.logger.log(`checkLoginAttempt:: Checking login attempt (username=${username}).`);
    this.logger.log(`checkLoginAttempt:: Finding the Client.`);
    const client: ClientEntity = await this.clientRepository.findOne({ where: { username } });
    if (!client) {
      this.logger.log(`checkLoginAttempt:: The Client (username=${username}) was not found.`);
      const description: string = `Client username=${username} was not found.`;
      const response: ServiceResponse = { status: 404, payload: {}, errors: [], description };
      this.logger.log(`checkLoginAttempt:: Returning response: ${response}`);
      return response;
    }

    this.logger.log(`checkLoginAttempt:: Checking if the password matches.`);
    const passwordMatched: boolean = await this.comparePassword(client.password, attempt);
    if (!passwordMatched) {
      this.logger.log(`checkLoginAttempt:: The password attempt didn't match with the password stored.`);
      const description: string = `Bad password`;
      const response: ServiceResponse = { status: 401, payload: {}, errors: [], description };
      this.logger.log(`checkLoginAttempt:: Returning response: ${response}`);
      return response;
    }

    this.logger.log(`checkLoginAttempt:: Passwords matched. Successful login.`);
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

  async findOne(username: string): Promise<ServiceResponse> {
    this.logger.log(`findOne:: Finding the Client (username=${username}).`);
    const client: ClientEntity = await this.clientRepository.findOne({ where: { username } });
    if (!client) {
      this.logger.log(`findOne:: The Client (username=${username}) was not found.`);
      const description: string = `Client username=${username} was not found.`;
      const response: ServiceResponse = { status: 404, payload: {}, errors: [], description };
      this.logger.log(`findOne:: Returning response: ${response}`);
      return response;
    }

    this.logger.log(`findOne:: Client successfully found.`);
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

  async validate(client: ClientDto): Promise<ServiceValidationResponse> {
    this.logger.log(`validate:: Validating the client (username=${client.username}).`);
    let isOk = true;
    const errors: ServiceError[] = [];

    this.logger.log(`validate:: Checking if there's already a client registered with this username.`);
    const existingClient: ClientEntity = await this.clientRepository.findOne({ where: { username: client.username } });
    if (existingClient) {
      this.logger.log(`validate:: A Client with the username=${client.username} was found.`);
      isOk = false;
      errors.push({ code: 'CONFLICT', field: 'username', message: 'Username registered.' });
    }

    const response: ServiceValidationResponse = { isOk, errors };
    this.logger.log(`validate:: Returning response: ${response}`);
    return response;
  }

  async create(data: ClientDto): Promise<ServiceResponse> {
    this.logger.log(`create:: Saving the Client (username=${data.username}) if it's valid.`);
    this.logger.log(`create:: Validating the Client before saving it.`);
    const validation =  await this.validate(data);
    if (!validation.isOk) {
      this.logger.log(`create:: Client is not valid.`);
      const response: ServiceResponse = { status: 422, errors: validation.errors, payload: {}, description: 'Server was not able to register this client.' };
      this.logger.log(`create:: Returning response: ${response}`);
      return response;
    }

    this.logger.log(`create:: Hashing the password before saving it.`);
    const hash = await this.hashPassword(data.password);
    this.logger.log(`create:: Insert the Client into the database.`);
    const client: ClientEntity = this.clientRepository.create({ ...data, password: hash });
    await this.clientRepository.save(client);

    const { password, ...result } = client;
    this.logger.log(`create:: Client successfully saved.`);
    return { status: 201, payload: { client: result }, errors: [], description: 'Client successfully created.' };
  }

  async findById(id: string): Promise<ServiceResponse> {
    this.logger.log(`findById:: Finding the Client (id=${id}).`);
    const client: ClientEntity = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      this.logger.log(`findById:: The Client (id=${id}) was not found.`);
      const description: string = `Client id=${id} was not found.`;
      const response: ServiceResponse = { status: 404, payload: {}, errors: [], description };
      this.logger.log(`findById:: Returning response: ${response}`);
      return response;
    }

    this.logger.log(`findById:: Client successfully found.`);
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

}
