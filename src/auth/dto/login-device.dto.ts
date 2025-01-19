import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDeviceRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  clientId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  clientSecret: string;
}

export class LoginDeviceResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  tokenType: string;

  constructor(partial: Partial<LoginDeviceResponseDto>) {
    Object.assign(this, partial);
  }
}
