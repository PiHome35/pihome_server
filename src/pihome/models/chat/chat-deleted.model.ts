import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ChatDeletedDto {
  @Field()
  chatId: string;
}
