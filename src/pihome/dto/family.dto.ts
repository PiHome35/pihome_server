import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
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

  @ApiProperty({ format: 'date-time' })
  @Transform(({ value }) => value.toISOString())
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  @Transform(({ value }) => value.toISOString())
  updatedAt: Date;
}
