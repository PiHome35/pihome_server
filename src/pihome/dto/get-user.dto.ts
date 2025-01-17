import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetUserResponseDto {
  @ApiProperty({ description: 'User id', example: 'as213123123' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ description: 'User name', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'User email', example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ description: 'User family id', example: 'as213123123' })
  @IsString()
  familyId?: string;

  @ApiProperty({ description: 'User family name', example: 'Doe Family' })
  @IsString()
  familyName?: string;
}
