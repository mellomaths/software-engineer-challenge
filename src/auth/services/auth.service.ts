import { Injectable } from '@nestjs/common';
import { ClientCredentialsService } from './client-credentials.service';

@Injectable()
export class AuthService {
  constructor(private clientCredentialsService: ClientCredentialsService) {}

  async validate(id: string, pass: string): Promise<any> {
    const client = await this.clientCredentialsService.findById(id);
    if (client && client.secret === pass) {
      const { secret, ...result } = client;
      return result;
    }

    return null;
  }
}
