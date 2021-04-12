import { Injectable } from '@nestjs/common';
import { IdentityService } from './identity.service';

@Injectable()
export class AuthService {
  constructor(private identityService: IdentityService) {}

  async validate(username: string, pass: string): Promise<any> {
    const client = await this.identityService.findOne(username);
    if (client && client.password === pass) {
      const { password, ...result } = client;
      return result;
    }

    return null;
  }
}
