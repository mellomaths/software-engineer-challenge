import * as redisStore from 'cache-manager-redis-store';

import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { ClientEntity } from './auth/entities/client.entity';
import { UserPriorityEntity } from './users/entities/user-priority.entity';
import { UserEntity } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
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
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('cache.host'),
        port: configService.get('cache.port'),
        ttl: configService.get('cache.timeToLive'),
        max: configService.get('cache.maxResponsesStored'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    RedisModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
