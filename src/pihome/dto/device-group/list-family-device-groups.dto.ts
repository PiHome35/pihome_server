import { ApiProperty } from '@nestjs/swagger';
import { DeviceGroupResponseDto } from '../device-group.dto';
import { Type } from 'class-transformer';

export class ListFamilyDeviceGroupsResponseDto {
  @ApiProperty({ type: [DeviceGroupResponseDto] })
  @Type(() => DeviceGroupResponseDto)
  deviceGroups: DeviceGroupResponseDto[];

  constructor(partial: Partial<ListFamilyDeviceGroupsResponseDto>) {
    Object.assign(this, partial);
  }
}
