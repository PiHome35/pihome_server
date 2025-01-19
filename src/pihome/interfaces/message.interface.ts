import { ObjectId } from 'mongodb';

export interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
  chatId: string;
}
