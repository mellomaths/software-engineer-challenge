import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { IdentityService } from './services/identity.service';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [PassportModule],
  providers: [AuthService, IdentityService, LocalStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
