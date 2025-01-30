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
import { GeminiLangchainService } from 'src/agent/gemini/gemini-langchain.service';
import { Device } from '@prisma/client';

import { AgentService } from 'src/agent/agent.service';
import { ModelAIName } from 'src/agent/constants/model';

@Injectable()
export class ChatService {
  constructor(
    private readonly mongoService: MongoService,
    private readonly agentService: AgentService,
  ) {}
  private async updateChatLatestMessage(message: Message): Promise<void> {
    const db = this.mongoService.getDb();
    await db.collection<Chat>('chats').updateOne(
      { _id: new ObjectId(message.chatId) },
      {
        $set: {
          latestMessageId: message.id,
          updatedAt: new Date(),
        },
      },
    );
  }
  private async saveMessage(message: NewMessageInput): Promise<MessageDto> {
    const db = this.mongoService.getDb();
    const messageId = new ObjectId();
    const newMessage: Message = {
      id: messageId.toString(),
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      createdAt: new Date(),
    };
    await db.collection<Message>('chat_messages').insertOne(newMessage);
    await this.updateChatLatestMessage(newMessage);

    return {
      id: newMessage.id,
      chatId: newMessage.chatId,
      content: newMessage.content,
      senderId: newMessage.senderId,
      createdAt: newMessage.createdAt,
    };
  }

  async createDeviceChat(device: Device): Promise<ChatDto> {
    const db = this.mongoService.getDb();
    const newChat: Omit<Chat, 'id'> = {
      familyId: device.familyId,
      name: `${device.name} Chat`,
      createdAt: new Date(),
      updatedAt: new Date(),
      latestMessageId: null,
      deviceId: device.id,
    };

    const chat = await db.collection<Chat>('chats').insertOne(newChat);
    const newChatDto: ChatDto = {
      id: chat.insertedId.toString(),
      name: newChat.name,
      familyId: newChat.familyId,
      latestMessage: null,
      createdAt: newChat.createdAt,
      updatedAt: newChat.updatedAt,
      deviceId: newChat.deviceId,
    };
    return newChatDto;
  }

  async deleteDeviceChat(deviceId: string): Promise<void> {
    const db = this.mongoService.getDb();
    await db.collection<Chat>('chats').deleteOne({ deviceId });
  }

  async createChat(familyId: string): Promise<ChatDto> {
    const db = this.mongoService.getDb();
    const newChat: Omit<Chat, 'id'> = {
      familyId,
      name: 'New Chat',
      createdAt: new Date(),
      updatedAt: new Date(),
      latestMessageId: null,
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
    if (!chat) {
      throw new Error('Chat not found');
    }

    const userMessageDto = await this.saveMessage(message);
    return userMessageDto;
  }

  async addAiResponse(chatId: string, userMessageContent: string, chatModelId: string): Promise<MessageDto> {
    const db = this.mongoService.getDb();
    const chat = await db.collection<Chat>('chats').findOne({ _id: new ObjectId(chatId) });
    if (!chat) {
      throw new Error('Chat not found');
    }
    const aiId: string = 'cb99a5c3-651e-4958-bf41-6c8f2d7ca40c';
    const familyId: string = chat.familyId;
    console.log('familyId', familyId);
    const aiResponseText = await this.agentService.processMessage(
      userMessageContent,
      familyId,
      ModelAIName.GEMINI_FLASH,
    );

    const aiMessage: NewMessageInput = {
      chatId,
      senderId: aiId,
      content: aiResponseText,
    };

    const aiMessageDto = await this.saveMessage(aiMessage);
    return aiMessageDto;
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
          deviceId: chat.deviceId,
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
          deviceId: chat.deviceId,
        };
      }),
    );

    return response;
  }

  async getDeviceChat(deviceId: string): Promise<ChatDto> {
    const db = this.mongoService.getDb();
    const chat = await db.collection<Chat>('chats').findOne({ deviceId });

    if (!chat) {
      throw new Error('Device chat not found');
    }

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
      deviceId: chat.deviceId,
    };
  }
}
