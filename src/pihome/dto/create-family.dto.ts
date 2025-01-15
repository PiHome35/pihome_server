import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class CreateFamilyRequestDto {
  @ApiProperty({ description: 'Family name', example: 'My Family', required: true })
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class CreateFamilyResponseDto {
  @ApiProperty({ description: 'Family id', example: 'as213123123' })
  @IsNotEmpty()
  @IsString()
  id: string;
}
