import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '@prisma/client';

@Injectable()
export class GqlStrategy extends PassportStrategy(Strategy, 'gql') {
  constructor(private authService: AuthService) {
    super();
  }
}
