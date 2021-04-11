import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { ClientCredentialsService } from './services/client-credentials.service';

@Module({
  providers: [AuthService, ClientCredentialsService],
  imports: []
})
export class AuthModule {}
