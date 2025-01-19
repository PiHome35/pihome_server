import { ApiProperty } from '@nestjs/swagger';
import { ChatModelResponseDto } from '../chat-model.dto';
import { Type } from 'class-transformer';

export class ListChatModelsResponseDto {
  @ApiProperty({ type: [ChatModelResponseDto] })
  @Type(() => ChatModelResponseDto)
  chatModels: ChatModelResponseDto[];

  constructor(partial: Partial<ListChatModelsResponseDto>) {
    Object.assign(this, partial);
  }
}
