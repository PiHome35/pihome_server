import { User } from '@prisma/client';
import { LoginUserResponse } from './login-user.interface';

export interface RegisterUserResponse {
  user: User;
  login: LoginUserResponse;
}
