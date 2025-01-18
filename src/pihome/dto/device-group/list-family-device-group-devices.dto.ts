import { ApiProperty } from '@nestjs/swagger';
import { DeviceResponseDto } from '../device.dto';

export class ListFamilyDeviceGroupDevicesResponseDto {
  @ApiProperty({ type: [DeviceResponseDto] })
  devices: DeviceResponseDto[];
}
