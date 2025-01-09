import { ClientType } from '../constants/client-type.enum';

export interface JwtPayload {
  sub: string;
  clientType: ClientType;
}
