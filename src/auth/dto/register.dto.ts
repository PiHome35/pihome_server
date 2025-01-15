import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { LoginResponseDto } from './login.dto';

export class RegisterUserRequestDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The password for the user account',
    minLength: 8,
    example: 'password123',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'The name of the user',
    maxLength: 50,
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}

export class RegisterUserResponseDto extends LoginResponseDto {}

export class RegisterDeviceRequestDto {
  @ApiProperty({
    description: 'The client ID of the device',
    example: '1234567890',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    description: 'The name of the device',
    example: 'My Device',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'The device group ID to add the device to. Add to default device group if not provided.',
    example: '1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  deviceGroupId?: string;
}

export class RegisterDeviceResponseDto {
  @ApiProperty({
    description: 'The client ID of the device',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    description: 'The client secret of the device',
    example: 'some-client-secret',
  })
  @IsString()
  @IsNotEmpty()
  clientSecret: string;
}
