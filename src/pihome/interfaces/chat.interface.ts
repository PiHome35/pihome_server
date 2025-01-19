import { Message } from './message.interface';

export interface Chat {
  id?: string;
  familyId: string;
  name: string;
  latestMessageId?: string;
  createdAt: Date;
  updatedAt: Date;
}
