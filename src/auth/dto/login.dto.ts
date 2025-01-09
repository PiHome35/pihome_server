import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginUserRequestDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The password for the user account',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class LoginDeviceRequestDto {
  @ApiProperty({
    description: 'The client id of the device',
    example: 'some-client-id',
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

export class LoginResponseDto {
  @ApiProperty({
    description: 'The access token for accessing the API',
    example: 'example-access-token',
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @ApiProperty({
    description: 'The type of the access token',
    example: 'Bearer',
  })
  @IsString()
  @IsNotEmpty()
  tokenType: string;
}
