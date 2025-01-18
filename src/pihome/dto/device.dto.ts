import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class DeviceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  isOn: boolean;

  @ApiProperty()
  isMuted: boolean;

  @ApiProperty()
  volumePercent: number;

  @ApiProperty()
  isSoundServer: boolean;

  @ApiProperty()
  familyId: string;

  @ApiProperty({ nullable: true })
  deviceGroupId: string | null;

  @ApiProperty()
  @Transform(({ value }) => value.toISOString())
  createdAt: Date;

  @ApiProperty({ nullable: true })
  @Transform(({ value }) => (value ? value.toISOString() : null))
  updatedAt: Date | null;
}
