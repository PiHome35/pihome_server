import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Message } from 'src/pihome/interfaces/message.interface';
import { MessageDto } from '../models/chat/message.model';
import { ChatDto } from '../models/chat/chat.model';
import { NewMessageInput } from '../models/chat/newMessage.input';
import { MongoService } from 'src/database/mongo.service';
import { PaginationDto } from '../models/chat/pagination.model';
import { Chat } from '../interfaces/chat.interface';
import { Device } from '@prisma/client';

import { AgentService } from 'src/agent/agent.service';
import { ModelAIName } from 'src/agent/constants/model';
import { FamiliesService } from './families.service';
import { ChatModelsService } from './chat-models.service';
import { ChatModelKey } from '../constants/chat-model.constant';

@Injectable()
export class ChatService {
  constructor(
    private readonly mongoService: MongoService,
    private readonly agentService: AgentService,
    private readonly familiesService: FamiliesService,
    private readonly chatModelsService: ChatModelsService,
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

  async createChat(familyId: string, name: string = 'New Chat'): Promise<ChatDto> {
    const db = this.mongoService.getDb();
    const newChat: Omit<Chat, 'id'> = {
      familyId,
      name,
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

  async deleteChat(chatId: string): Promise<string> {
    const db = this.mongoService.getDb();
    try {
      // Find chat before deletion
      const chatTarget = await db.collection<Chat>('chats').findOne({ _id: new ObjectId(chatId) });
      if (!chatTarget) {
        throw new Error('Chat not found');
      }

      // Delete the chat
      await db.collection<Chat>('chats').deleteOne({ _id: chatTarget._id });

      // Delete all messages associated with this chat
      await db.collection<Message>('chat_messages').deleteMany({ chatId });

      return chatId;
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw new Error('Failed to delete chat');
    }
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

  async addAiResponse(chatId: string, userMessageContent: string, userId: string): Promise<MessageDto> {
    try {
      const db = this.mongoService.getDb();
      const chat = await db.collection<Chat>('chats').findOne({ _id: new ObjectId(chatId) });
      if (!chat) {
        throw new Error('Chat not found');
      }
      const familyId: string = chat.familyId;
      const family = await this.familiesService.getFamily(familyId);
      const chatModelId = family.chatModelId;
      let aiResponseText: string;
      let modelName: ModelAIName;
      const chatModel = await this.chatModelsService.getChatModel(chatModelId);
      if (chatModel.key == ChatModelKey.DEEPSEEK_R1) {
        modelName = ModelAIName.DEEP_SEEK;
      } else if (chatModel.key == ChatModelKey.GEMINI_1_5_FLASH) {
        modelName = ModelAIName.GEMINI_FLASH;
      } else if (chatModel.key == ChatModelKey.GEMINI_1_5_PRO) {
        modelName = ModelAIName.GEMINI_PRO;
      } else if (chatModel.key == ChatModelKey.LLAMA_3_3_70B_INSTRUCT) {
        modelName = ModelAIName.LLAMA_3_3_70B;
      } else if (chatModel.key == ChatModelKey.GPT_4O) {
        modelName = ModelAIName.OPENAI_GPT_4O;
      } else if (chatModel.key == ChatModelKey.GPT_4O_MINI) {
        modelName = ModelAIName.OPENAI_GPT_4O_MINI;
      }
      try {
        aiResponseText = await this.agentService.processMessageWithLangGraph(
          userMessageContent,
          familyId,
          userId,
          chatId,
          modelName,
        );
        // aiResponseText = await this.agentService.processMessageWithMultiAgent(
        //   userMessageContent,
        //   familyId,
        //   chatId,
        //   modelName,
        // );
      } catch (aiError) {
        console.error('AI Processing Error:', aiError);
        aiResponseText = "I'm sorry, I'm having trouble processing your message right now.";
      }

      const aiMessage: NewMessageInput = {
        chatId,
        senderId: chatModelId,
        content: aiResponseText,
      };

      const aiMessageDto = await this.saveMessage(aiMessage);
      return aiMessageDto;
    } catch (error) {
      console.error('Error in addAiResponse:', error);
      throw new Error('Failed to process AI response');
    }
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

  async getAllChats(familyId: string, pagination?: PaginationDto): Promise<ChatDto[]> {
    const { limit = 20, skip = 0 } = pagination || {};
    const db = this.mongoService.getDb();

    const chats = await db.collection<Chat>('chats').find({ familyId }).toArray();

    const response: ChatDto[] = await Promise.all(
      chats.map(async (chat) => {
        let latestMessage = null;
        if (chat.latestMessageId) {
          const message = await db.collection<Message>('chat_messages').findOne({ id: chat.latestMessageId });
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
      const message = await db.collection<Message>('chat_messages').findOne({ id: chat.latestMessageId });
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
