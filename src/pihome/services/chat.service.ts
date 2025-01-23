import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Message } from 'src/pihome/interfaces/message.interface';
import { MessageDto } from '../models/chat/message.model';
import { ChatDto } from '../models/chat/chat.model';
import { NewMessageInput } from '../models/chat/newMessage.input';
import { MongoService } from 'src/database/mongo.service';
import { NewChatDto } from '../models/chat/new-chat.model';
import { PaginationDto } from '../models/chat/pagination.model';
import { Chat } from '../interfaces/chat.interface';

// interface MessageDocument {
//   _id: ObjectId;
//   chatId: string;
//   senderId: string;
//   content: string;
//   createdAt: Date;
// }

@Injectable()
export class ChatService {
  constructor(private readonly mongoService: MongoService) {}

  async createChat(familyId: string): Promise<ChatDto> {
    const db = this.mongoService.getDb();
    const newChat: Omit<Chat, 'id'> = {
      familyId,
      name: 'New Chat',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const chat = await db.collection<Chat>('chats').insertOne(newChat);
    const newChatDto: ChatDto = {
      id: chat.insertedId.toString(),
      name: newChat.name,
      familyId: newChat.familyId,
      latestMessage: null,
      createdAt: newChat.createdAt,
      updatedAt: newChat.updatedAt,
    };
    return newChatDto;
  }

  async addMessage(message: NewMessageInput): Promise<MessageDto> {
    const db = this.mongoService.getDb();
    const chat = await db.collection<Chat>('chats').findOne({ _id: new ObjectId(message.chatId) });

    console.log('senderId', message.senderId);

    if (!chat) {
      throw new Error('Chat not found');
    }

    const messageId = new ObjectId();
    const newMessage: Message = {
      id: messageId.toString(),
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      createdAt: new Date(),
    };

    await db.collection<Message>('chat_messages').insertOne(newMessage);

    await db.collection<Chat>('chats').updateOne(
      { _id: new ObjectId(message.chatId) },
      {
        $set: {
          latestMessageId: messageId.toString(),
          updatedAt: new Date(),
        },
      },
    );

    return {
      id: messageId.toString(),
      content: message.content,
      chatId: message.chatId,
      senderId: message.senderId,
      createdAt: newMessage.createdAt,
    };
  }

  async getChatMessages(chatId: string, pagination?: PaginationDto): Promise<MessageDto[]> {
    const { limit = 20, skip = 0 } = pagination || {};
    const db = this.mongoService.getDb();

    const messages = await db
      .collection<Message>('chat_messages')
      .find({ chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return messages.map((message) => ({
      id: message._id.toString(),
      content: message.content,
      senderId: message.senderId,
      chatId,
      createdAt: message.createdAt,
    }));
  }

  async getChats(): Promise<ChatDto[]> {
    const db = this.mongoService.getDb();
    const chats = await db.collection<Chat>('chats').find({}).toArray();

    const response: ChatDto[] = await Promise.all(
      chats.map(async (chat) => {
        let latestMessage = null;
        if (chat.latestMessageId) {
          const message = await db
            .collection<Message>('chat_messages')
            .findOne({ _id: new ObjectId(chat.latestMessageId) });
          if (message) {
            latestMessage = {
              id: message._id.toString(),
              content: message.content,
              senderId: message.senderId,
              chatId: chat.id,
              createdAt: message.createdAt,
            };
          }
        }

        return {
          id: chat._id.toString(),
          familyId: chat.familyId,
          name: chat.name,
          latestMessage,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        };
      }),
    );

    return response;
  }

  async getAllChatsWithFamilyId(familyId: string, pagination?: PaginationDto): Promise<ChatDto[]> {
    const { limit = 20, skip = 0 } = pagination || {};
    const db = this.mongoService.getDb();

    const chats = await db.collection<Chat>('chats').find({ familyId }).toArray();

    const response: ChatDto[] = await Promise.all(
      chats.map(async (chat) => {
        let latestMessage = null;
        if (chat.latestMessageId) {
          const message = await db
            .collection<Message>('chat_messages')
            .findOne({ _id: new ObjectId(chat.latestMessageId) });
          if (message) {
            latestMessage = {
              id: message._id.toString(),
              content: message.content,
              senderId: message.senderId,
              chatId: chat._id.toString(),
              createdAt: message.createdAt,
            };
          }
        }

        return {
          id: chat._id.toString(),
          familyId: chat.familyId,
          name: chat.name,
          latestMessage,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        };
      }),
    );

    return response;
  }
}
