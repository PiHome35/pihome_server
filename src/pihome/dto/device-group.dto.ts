import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class DeviceGroupResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  familyId: string;

  @ApiProperty({ format: 'date-time' })
  @Transform(({ value }) => value.toISOString())
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  @Transform(({ value }) => value.toISOString())
  updatedAt: Date;

  constructor(partial: Partial<DeviceGroupResponseDto>) {
    Object.assign(this, partial);
  }
}
