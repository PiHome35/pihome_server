import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class JoinFamilyRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;
}
