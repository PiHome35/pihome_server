import { ApiProperty } from '@nestjs/swagger';
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
  device: DeviceResponseDto;

  @ApiProperty()
  clientSecret: string;
}
