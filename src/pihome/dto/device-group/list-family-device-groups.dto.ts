import { ApiProperty } from '@nestjs/swagger';
import { DeviceGroupResponseDto } from '../device-group.dto';

export class ListFamilyDeviceGroupsResponseDto {
  @ApiProperty({ type: [DeviceGroupResponseDto] })
  deviceGroups: DeviceGroupResponseDto[];
}
