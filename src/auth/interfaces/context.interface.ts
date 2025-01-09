import { ClientType } from '../constants/client-type.enum';

export interface ClientContext {
  readonly clientType: ClientType;
  readonly clientId: string;
}
