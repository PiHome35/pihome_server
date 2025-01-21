import { IsDate, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MessageDto {
  @Field()
  @IsString()
  id: string;

  @Field()
  @IsString()
  content: string;

  @Field()
  @IsString()
  chatId: string;

  @Field()
  @IsString()
  senderId: string;

  @Field(() => Date)
  @IsDate()
  @Type(() => Date)
  createdAt: Date;
}
