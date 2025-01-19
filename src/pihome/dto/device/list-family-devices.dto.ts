import { ApiProperty } from '@nestjs/swagger';
import { DeviceResponseDto } from '../device.dto';
import { Type } from 'class-transformer';

export class ListFamilyDevicesResponseDto {
  @ApiProperty({ type: [DeviceResponseDto] })
  @Type(() => DeviceResponseDto)
  devices: DeviceResponseDto[];
}
