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
import { Inject } from '@nestjs/common';

@Resolver('Chat')
@UseGuards(GqlAuthGuard)
export class ChatResolver {
  constructor(
    private readonly chatService: ChatService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @Query(() => [ChatDto])
  async getAllChatsWithFamilyId(
    @Args('familyId') familyId: string,
    @Args('pagination', { nullable: true }) pagination?: PaginationDto,
  ): Promise<ChatDto[]> {
    return this.chatService.getAllChatsWithFamilyId(familyId, pagination);
  }

  @Query(() => [MessageDto])
  async getChatMessages(
    @Args('chatId') chatId: string,
    @Args('pagination', { nullable: true }) pagination?: PaginationDto,
  ): Promise<MessageDto[]> {
    return this.chatService.getChatMessages(chatId, pagination);
  }

  @Mutation(() => ChatDto)
  async createNewChat(@Args('familyId') familyId: string, @CurrentClient() user: User): Promise<ChatDto> {
    const newChat = await this.chatService.createChat(familyId);
    console.log('newChat: ', newChat);
    this.pubSub.publish('chatCreated', { chatCreated: newChat });
    return newChat;
  }

  @Mutation(() => MessageDto)
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
    this.pubSub.publish(`messageAdded-${chatId}`, { messageAdded: messageDto });
    return messageDto;
  }

  @Subscription(() => MessageDto, { nullable: true })
  messageAdded(@Args('chatId') chatId: string) {
    return this.pubSub.asyncIterableIterator(`messageAdded-${chatId}`);
  }

  @Subscription(() => NewChatDto)
  chatCreated() {
    return this.pubSub.asyncIterableIterator('chatCreated');
  }
}
