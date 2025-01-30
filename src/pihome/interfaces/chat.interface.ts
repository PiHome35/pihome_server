import { Message } from './message.interface';

export interface Chat {
  id?: string;
  familyId: string;
  name: string;
  // latestMessage?: Message;
  latestMessageId: string;
  createdAt: Date;
  updatedAt: Date;
  deviceId?: string;
}
