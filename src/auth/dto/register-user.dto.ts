import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { LoginUserResponseDto } from './login-user.dto';
import { UserResponseDto } from 'src/pihome/dto/user.dto';
import { Type } from 'class-transformer';

export class RegisterUserRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class RegisterUserResponseDto {
  @ApiProperty({ type: UserResponseDto })
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @ApiProperty({ type: LoginUserResponseDto })
  @Type(() => LoginUserResponseDto)
  login: LoginUserResponseDto;

  constructor(partial: Partial<RegisterUserResponseDto>) {
    Object.assign(this, partial);
  }
}
