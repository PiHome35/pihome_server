import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ClientContext } from '../interfaces/context.interface';

@Injectable()
export class UserLocalStrategy extends PassportStrategy(Strategy, 'user-local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<ClientContext> {
    console.log('email: ', email);
    console.log('password: ', password);
    return this.authService.validateAndGetUserContext(email, password);
  }
}
