import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IdentityService } from './identity.service';

@Injectable()
export class AuthService {
  constructor(
    private identityService: IdentityService,
    private jwtService: JwtService,
  ) {}

  async validate(username: string, attempt: string): Promise<any> {
    const serviceResponse = await this.identityService.checkLoginAttempt(username, attempt);
    if (serviceResponse.status === 200) {
      return serviceResponse.payload.client;
    }

    return null;
  }

  async login(client: any) {
    const payload = {
      id: client.id,
      username: client.username,
      sub: client.id
    };

    return { access_token: this.jwtService.sign(payload) };
  }

}
