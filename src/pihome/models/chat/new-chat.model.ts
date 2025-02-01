import { Field, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@ObjectType()
export class NewChatDto {
  @Field()
  @IsString()
  id: string;

  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  familyId: string;
}

@ObjectType()
export class ChatDeletedDto {
  @Field()
  @IsString()
  chatId: string;
}
