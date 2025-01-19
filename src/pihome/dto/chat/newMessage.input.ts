import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class NewMessageInput {
  @Field()
  chatId: string;
  @Field()
  content: string;

  @Field()
  senderId: string;
}
