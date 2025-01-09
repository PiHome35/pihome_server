import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserContext } from '../interfaces/context.interface';

@Injectable()
export class UserLocalStrategy extends PassportStrategy(Strategy, 'user-local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<UserContext> {
    const userContext = await this.authService.validateUser(email, password);
    if (!userContext) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return userContext;
  }
}
