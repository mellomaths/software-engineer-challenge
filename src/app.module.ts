import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './application/auth/auth.module';
import { ClientEntity } from './application/auth/entities/client.entity';
import { UserPriorityEntity } from './application/users/entities/user-priority.entity';
import { UserEntity } from './application/users/entities/user.entity';
import { UsersModule } from './application/users/users.module';
import { RedisModule } from './infrastructure/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.TYPEORM_CONNECTION as any,
      host: process.env.TYPEORM_HOST,
      port: parseInt(process.env.TYPEORM_PORT),
      username: process.env.TYPEORM_USERNAME,
      password: process.env.TYPEORM_PASSWORD,
      database: process.env.TYPEORM_DATABASE,
      entities: [ClientEntity, UserEntity, UserPriorityEntity],
      logging: true,
    }),
    AuthModule,
    UsersModule,
    RedisModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
