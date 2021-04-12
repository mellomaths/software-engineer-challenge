import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IdentityService } from './identity.service';

@Injectable()
export class AuthService {
  constructor(
    private identityService: IdentityService,
    private jwtService: JwtService,
  ) {}

  async validate(username: string, pass: string): Promise<any> {
    const client = await this.identityService.findOne(username);
    if (client && client.password === pass) {
      const { password, ...result } = client;
      return result;
    }

    return null;
  }

  async login(client: any) {
    const payload = {
      username: client.username,
      sub: client.id
    };

    return { access_token: this.jwtService.sign(payload) };
  }

}
