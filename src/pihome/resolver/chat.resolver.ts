import { Resolver, Query, Mutation, Subscription, Args } from '@nestjs/graphql';
import { ChatService } from '../services/chat.service';
import { PubSub } from 'graphql-subscriptions';
import { Public } from 'src/auth/decorators/public.decorator';
import { NewMessageInput } from '../dto/chat/newMessage.input';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user';
import { MessageDto } from '../dto/chat/message.dto';
import { NewChatDto } from '../dto/chat/new-chat.dto';
import { ChatDto } from '../dto/chat/chat.dto';
import { PaginationDto } from '../dto/chat/pagination.dto';
import { User } from '@prisma/client';
const pubSub = new PubSub();

@Resolver('Chat')
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @Public()
  @Query(() => [ChatDto])
  @UseGuards(GqlAuthGuard)
  async getAllChatsWithFamilyId(
    @Args('familyId') familyId: string,
    @Args('pagination', { nullable: true }) pagination?: PaginationDto,
  ): Promise<ChatDto[]> {
    return this.chatService.getAllChatsWithFamilyId(familyId, pagination);
  }

  @Public()
  @Query(() => [MessageDto])
  @UseGuards(GqlAuthGuard)
  async getChatMessages(
    @Args('chatId') chatId: string,
    @Args('pagination', { nullable: true }) pagination?: PaginationDto,
  ): Promise<MessageDto[]> {
    return this.chatService.getChatMessages(chatId, pagination);
  }

  @Public()
  @Mutation(() => ChatDto)
  @UseGuards(GqlAuthGuard)
  async createNewChat(@Args('familyId') familyId: string, @CurrentUser() user: User): Promise<ChatDto> {
    const newChat = await this.chatService.createChat(familyId);
    console.log('newChat: ', newChat);
    pubSub.publish('chatCreated', { chatCreated: newChat });
    return newChat;
  }

  @Public()
  @Mutation(() => MessageDto)
  @UseGuards(GqlAuthGuard)
  async addMessage(
    @Args('content') content: string,
    @Args('chatId') chatId: string,
    @CurrentUser() user: { clientType: string; sub: string },
  ): Promise<MessageDto> {
    const newMessage: NewMessageInput = {
      content,
      senderId: user.sub,
      chatId,
    };
    const messageDto = await this.chatService.addMessage(newMessage);
    pubSub.publish(`messageAdded-${chatId}`, { messageAdded: messageDto });
    return messageDto;
  }

  @Public()
  @Subscription(() => MessageDto, { nullable: true })
  messageAdded(@Args('chatId') chatId: string) {
    return pubSub.asyncIterableIterator(`messageAdded-${chatId}`);
  }

  @Public()
  @Subscription(() => NewChatDto)
  chatCreated() {
    return pubSub.asyncIterableIterator('chatCreated');
  }
}
