import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ClientContext } from '../interfaces/context.interface';

@Injectable()
export class DeviceLocalStrategy extends PassportStrategy(Strategy, 'device-local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'clientId',
      passwordField: 'clientSecret',
    });
  }

  async validate(clientId: string, clientSecret: string): Promise<ClientContext> {
    const deviceContext = await this.authService.validateDevice(clientId, clientSecret);
    if (!deviceContext) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return deviceContext;
  }
}
