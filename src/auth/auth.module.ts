import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { IdentityService } from './services/identity.service';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import authConfig from 'src/config/auth.config';

@Module({
  imports: [
    PassportModule,
    ConfigModule.forRoot({
      load: [authConfig]
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwt.secret'),
        signOptions: {
          expiresIn: configService.get('auth.jwt.expirationTime'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, IdentityService, LocalStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
