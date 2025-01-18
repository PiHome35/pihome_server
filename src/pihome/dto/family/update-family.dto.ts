import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ChatModel } from 'src/pihome/constants/chat-model.constant';
import { FamilyResponseDto } from '../family.dto';

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

export class UpdateFamilyResponseDto extends FamilyResponseDto {}
