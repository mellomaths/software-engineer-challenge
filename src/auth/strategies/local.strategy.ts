import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(id: string, secret: string): Promise<any> {
    const client = await this.authService.validate(id, secret);
    if (!client) {
      throw new UnauthorizedException();
    }
    return client;
  }
}
