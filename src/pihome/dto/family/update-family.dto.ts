import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ChatModel } from 'src/pihome/constants/chat-model.constant';

export class UpdateFamilyRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ChatModel })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(ChatModel)
  chatModel?: ChatModel;
}
