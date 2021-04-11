import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { ClientCredentialsService } from './services/client-credentials.service';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [PassportModule],
  providers: [AuthService, ClientCredentialsService, LocalStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
