import { Resolver, Query, Mutation, Subscription, Args } from '@nestjs/graphql';
import { ChatService } from '../services/chat.service';
import { PubSub } from 'graphql-subscriptions';
import { NewMessageInput } from '../models/chat/newMessage.input';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentClient } from 'src/auth/decorators/current-client.decorator';
import { MessageDto } from '../models/chat/message.model';
import { NewChatDto } from '../models/chat/new-chat.model';
import { ChatDto } from '../models/chat/chat.model';
import { PaginationDto } from '../models/chat/pagination.model';
import { User } from '@prisma/client';
import { Inject, Logger } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { ChatDeletedDto } from '../models/chat/chat-deleted.model';

@Resolver('Chat')
export class ChatResolver {
  private readonly logger = new Logger(ChatResolver.name);
  constructor(
    private readonly chatService: ChatService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @Query(() => [ChatDto])
  @UseGuards(GqlAuthGuard)
  async getAllChatsWithFamilyId(
    @Args('familyId') familyId: string,
    @Args('pagination', { nullable: true }) pagination?: PaginationDto,
  ): Promise<ChatDto[]> {
    console.log('getAllChat');
    return this.chatService.getAllChats(familyId, pagination);
  }

  @Query(() => [MessageDto])
  @UseGuards(GqlAuthGuard)
  async getChatMessages(
    @Args('chatId') chatId: string,
    @Args('pagination', { nullable: true }) pagination?: PaginationDto,
  ): Promise<MessageDto[]> {
    return this.chatService.getChatMessages(chatId, pagination);
  }

  @Mutation(() => ChatDto)
  @UseGuards(GqlAuthGuard)
  async createNewChat(
    @Args('familyId') familyId: string,
    @Args('name', { nullable: true }) name?: string,
  ): Promise<ChatDto> {
    const newChat = await this.chatService.createChat(familyId, name);
    console.log('newChat: ', newChat);
    this.pubSub.publish('chatCreated', { chatCreated: newChat });
    return newChat;
  }

  @Mutation(() => MessageDto)
  @UseGuards(GqlAuthGuard)
  async addMessage(
    @Args('content') content: string,
    @Args('chatId') chatId: string,
    @CurrentClient() user: { clientType: string; sub: string },
    // @Args('modelConfig', { nullable: true }) modelConfig?: OpenRouterModelConfigInput,
  ): Promise<MessageDto> {
    const newMessage: NewMessageInput = {
      content,
      senderId: user.sub,
      chatId,
    };
    const messageDto = await this.chatService.addMessage(newMessage);
    await this.pubSub.publish(`messageAdded-${chatId}`, { messageAdded: messageDto });

    const messageAI = await this.chatService.addAiResponse(chatId, content, '1234');
    await this.pubSub.publish(`messageAdded-${chatId}`, { messageAdded: messageAI });
    return messageDto;
  }

  @Mutation(() => ChatDeletedDto)
  @UseGuards(GqlAuthGuard)
  async deleteChat(@Args('chatId') chatId: string): Promise<ChatDeletedDto> {
    try {
      const deletedChatId = await this.chatService.deleteChat(chatId);

      // Notify subscribers about the deletion
      await this.pubSub.publish('chatDeleted', {
        chatDeleted: {
          chatId: deletedChatId,
        },
      });

      return { chatId: deletedChatId };
    } catch (error) {
      this.logger.error(`Failed to delete chat ${chatId}:`, error);
      if (error.message === 'Chat not found') {
        throw new Error('Chat not found');
      }
      throw new Error('Failed to delete chat');
    }
  }

  // @Public()
  @Subscription(() => MessageDto, {
    nullable: true,
    filter: (payload, variables) => payload.messageAdded.chatId === variables.chatId,
  })
  messageAdded(@Args('chatId') chatId: string) {
    this.logger.log('messageAdded');
    try {
      return this.pubSub.asyncIterableIterator(`messageAdded-${chatId}`);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Public()
  @Subscription(() => NewChatDto)
  chatCreated() {
    return this.pubSub.asyncIterableIterator('chatCreated');
  }

  @Query(() => ChatDto)
  @UseGuards(GqlAuthGuard)
  async getDeviceChat(@Args('deviceId') deviceId: string): Promise<ChatDto> {
    return this.chatService.getDeviceChat(deviceId);
  }

  @Public()
  @Subscription(() => ChatDeletedDto, {
    filter: (payload, variables) => !variables.familyId || payload.chatDeleted.familyId === variables.familyId,
  })
  chatDeleted(@Args('familyId', { nullable: true }) familyId?: string) {
    return this.pubSub.asyncIterableIterator('chatDeleted');
  }
}
