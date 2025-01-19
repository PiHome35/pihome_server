import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { DeviceResponseDto } from '../device.dto';

export class RemoveFamilyDeviceGroupDevicesRequestDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  deviceIds: string[];
}

export class RemoveFamilyDeviceGroupDevicesResponseDto {
  @ApiProperty({ type: [DeviceResponseDto] })
  @Type(() => DeviceResponseDto)
  devices: DeviceResponseDto[];

  constructor(partial: Partial<RemoveFamilyDeviceGroupDevicesResponseDto>) {
    Object.assign(this, partial);
  }
}
