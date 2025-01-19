import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { FamilyResponseDto } from '../family.dto';

export class JoinFamilyRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class JoinFamilyResponseDto extends FamilyResponseDto {}
