import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class DeviceGroupResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  familyId: string;

  @ApiProperty()
  @Transform(({ value }) => value.toISOString())
  createdAt: Date;

  @ApiProperty({ nullable: true })
  @Transform(({ value }) => (value ? value.toISOString() : null))
  updatedAt: Date | null;
}
