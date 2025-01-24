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
    return this.chatService.getAllChatsWithFamilyId(familyId, pagination);
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
  async createNewChat(@Args('familyId') familyId: string, @CurrentClient() user: User): Promise<ChatDto> {
    const newChat = await this.chatService.createChat(familyId);
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
  ): Promise<MessageDto> {
    const newMessage: NewMessageInput = {
      content,
      senderId: user.sub,
      chatId,
    };
    const messageDto = await this.chatService.addMessage(newMessage);
    await this.pubSub.publish(`messageAdded-${chatId}`, { messageAdded: messageDto });

    const messageAI = await this.chatService.addAiResponse(chatId, content);
    await this.pubSub.publish(`messageAdded-${chatId}`, { messageAdded: messageAI });
    return messageDto;
  }

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
}
