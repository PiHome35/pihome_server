import { ClientType } from '../constants/client-type.enum';

export interface UserContext {
  readonly clientType: ClientType;
  readonly id: string;
}
