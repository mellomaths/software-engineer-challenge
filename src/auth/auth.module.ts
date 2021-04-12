import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { IdentityService } from './services/identity.service';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import authConfig from 'src/config/auth.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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
  providers: [AuthService, IdentityService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtAuthGuard]
})
export class AuthModule {}
