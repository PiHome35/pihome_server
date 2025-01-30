import { IsArray, IsDate, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MessageDto } from './message.model';
import { Field, ObjectType } from '@nestjs/graphql';

export class CreateChatDto {
  @IsString()
  familyId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class ChatDto {
  @Field(() => String)
  @IsString()
  id: string;

  @Field(() => String)
  @IsString()
  familyId: string;

  @Field(() => String)
  name: string;

  @Field(() => MessageDto, { nullable: true })
  @Type(() => MessageDto)
  latestMessage: MessageDto;

  @Field(() => Date)
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @Field(() => Date)
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  deviceId?: string;
}
