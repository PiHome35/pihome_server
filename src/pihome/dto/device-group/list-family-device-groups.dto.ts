import { ApiProperty } from '@nestjs/swagger';
import { DeviceGroupResponseDto } from '../device-group.dto';
import { Type } from 'class-transformer/types/decorators';

export class ListFamilyDeviceGroupsResponseDto {
  @ApiProperty({ type: [DeviceGroupResponseDto] })
  @Type(() => DeviceGroupResponseDto)
  deviceGroups: DeviceGroupResponseDto[];
}
