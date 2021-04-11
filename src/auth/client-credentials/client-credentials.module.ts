import { Module } from '@nestjs/common';
import { ClientCredentialsService } from './client-credentials.service';

@Module({
  providers: [ClientCredentialsService],
  exports: [ClientCredentialsService]
})
export class ClientCredentialsModule {}
