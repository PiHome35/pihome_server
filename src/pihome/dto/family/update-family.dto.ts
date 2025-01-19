import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ChatModelKey } from 'src/pihome/constants/chat-model.constant';

export class UpdateFamilyRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ChatModelKey })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(ChatModelKey)
  chatModelKey?: ChatModelKey;
}
