import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { FamilyResponseDto } from '../family.dto';

export class CreateFamilyRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class CreateFamilyResponseDto extends FamilyResponseDto {}
