import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer/types/decorators';
import { ChatModel } from '../constants/chat-model.constant';

export class FamilyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ChatModel })
  chatModel: ChatModel;

  @ApiProperty()
  ownerId: string;

  @ApiProperty({ nullable: true })
  inviteCode: string | null;

  @ApiProperty()
  @Transform(({ value }) => value.toISOString())
  createdAt: Date;

  @ApiProperty({ nullable: true })
  @Transform(({ value }) => (value ? value.toISOString() : null))
  updatedAt: Date | null;
}
