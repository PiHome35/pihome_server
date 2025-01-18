import { ApiProperty } from '@nestjs/swagger';
import { DeviceResponseDto } from '../device.dto';

export class ListFamilyDevicesResponseDto {
  @ApiProperty({ type: [DeviceResponseDto] })
  devices: DeviceResponseDto[];
}
