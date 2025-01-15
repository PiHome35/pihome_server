import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class CreateFamilyRequestDto {
  @ApiProperty({ example: 'My Family' })
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class CreateFamilyResponseDto {
  @ApiProperty({ example: 'as213123123' })
  @IsNotEmpty()
  @IsString()
  id: string;
}
