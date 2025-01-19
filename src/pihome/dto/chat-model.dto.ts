import { ApiProperty } from '@nestjs/swagger';

export class ChatModelResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt: Date;

  constructor(partial: Partial<ChatModelResponseDto>) {
    Object.assign(this, partial);
  }
}
