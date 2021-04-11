import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClientCredentialsModule } from './client-credentials/client-credentials.module';

@Module({
  providers: [AuthService],
  imports: [ClientCredentialsModule]
})
export class AuthModule {}
