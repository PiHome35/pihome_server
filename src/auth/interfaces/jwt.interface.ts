import { ClientType } from '../constants/client-type.enum';

export interface JwtPayload {
  clientType: ClientType;
  sub: string; // userId or deviceId
}
