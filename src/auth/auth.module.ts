import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserLocalStrategy } from './strategies/user-local.strategy';
import { ConfigService } from '@nestjs/config';
import { DeviceLocalStrategy } from './strategies/device-local.strategy';
import { PihomeModule } from 'src/pihome/pihome.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
        signOptions: { expiresIn: config.get<string>('jwt.expiresIn') },
      }),
    }),
    PihomeModule,
  ],
  providers: [AuthService, UserLocalStrategy, DeviceLocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
