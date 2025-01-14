import { ClientType } from '../constants/client-type.enum';

export interface UserContext {
  clientType: ClientType;
  sub: string; // userId or deviceId
}
