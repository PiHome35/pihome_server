import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class JoinFamilyRequestDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class JoinFamilyResponseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
