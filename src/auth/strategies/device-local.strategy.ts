import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserContext } from '../interfaces/context.interface';

@Injectable()
export class DeviceLocalStrategy extends PassportStrategy(Strategy, 'device-local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'clientId',
      passwordField: 'clientSecret',
    });
  }

  async validate(clientId: string, clientSecret: string): Promise<UserContext> {
    const userContext = await this.authService.validateDevice(clientId, clientSecret);
    if (!userContext) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return userContext;
  }
}
