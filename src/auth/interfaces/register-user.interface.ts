import { User } from 'prisma/generated/edge';
import { LoginUserResponse } from './login-user.interface';

export interface RegisterUserResponse {
  user: User;
  login: LoginUserResponse;
}
