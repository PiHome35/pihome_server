import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
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
    return this.authService.validateAndGetDeviceContext(clientId, clientSecret);
  }
}
