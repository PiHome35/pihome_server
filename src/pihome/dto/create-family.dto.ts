import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';
import { IsString } from 'class-validator';

export class CreateFamilyRequestDto {
  @ApiProperty({
    description: 'The name of the family',
    example: 'My Family',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}

export class CreateFamilyResponseDto {
  @ApiProperty({
    description: 'The id of the family',
    example: '1234567890',
  })
  id: string;
}
