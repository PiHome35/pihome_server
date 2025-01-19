import { ClientType } from '../constants/client-type.enum';

export interface ClientContext {
  clientType: ClientType;
  sub: string; // userId or deviceId
}
