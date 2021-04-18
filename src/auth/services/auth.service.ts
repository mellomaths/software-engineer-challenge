import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IdentityService } from './identity.service';

@Injectable()
export class AuthService {

  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly identityService: IdentityService,
    private readonly jwtService: JwtService,
  ) {}

  async validate(username: string, attempt: string): Promise<any> {
    this.logger.log(`validate:: Validating login for client (username=${username}).`);
    const serviceResponse = await this.identityService.checkLoginAttempt(username, attempt);
    if (serviceResponse.status === 200) {
      this.logger.log(`validate:: Client successfully logged in.`);
      return serviceResponse.payload.client;
    }

    this.logger.log(`validate:: Login failed.`);
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
