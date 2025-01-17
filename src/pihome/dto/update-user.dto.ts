import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateUserRequestDto {
  @ApiProperty({ description: 'User name', example: 'John Doe' })
  @IsString()
  name?: string;

  @ApiProperty({ description: 'User email', example: 'john.doe@example.com' })
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'User password', example: 'password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password?: string;
}

export class UpdateUserResponseDto {
  @ApiProperty({ description: 'User id', example: '1234567890' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ description: 'User name', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'User email', example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
