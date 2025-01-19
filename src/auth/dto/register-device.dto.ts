import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { DeviceResponseDto } from 'src/pihome/dto/device.dto';

export class RegisterDeviceRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  clientId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class RegisterDeviceResponseDto {
  @ApiProperty({ type: DeviceResponseDto })
  @Type(() => DeviceResponseDto)
  device: DeviceResponseDto;

  @ApiProperty()
  clientSecret: string;

  constructor(partial: Partial<RegisterDeviceResponseDto>) {
    Object.assign(this, partial);
  }
}
