import { Message } from './message.interface';

export interface Chat {
  _id: string;
  familyId: string;
  name: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}
