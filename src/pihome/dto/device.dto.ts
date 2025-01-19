import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';

export class DeviceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clientId: string;

  @Exclude()
  clientSecretHash: string;

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

  @ApiProperty({ format: 'date-time' })
  @Transform(({ value }) => value.toISOString())
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  @Transform(({ value }) => value.toISOString())
  updatedAt: Date;

  constructor(partial: Partial<DeviceResponseDto>) {
    Object.assign(this, partial);
  }
}
