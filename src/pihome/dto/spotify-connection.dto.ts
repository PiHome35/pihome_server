import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class SpotifyConnectionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;

  @ApiProperty({ format: 'date-time' })
  @Transform(({ value }) => value.toISOString())
  issuedAt: Date;

  @ApiProperty()
  spotifyDeviceId: string;

  @ApiProperty()
  familyId: string;

  @ApiProperty({ format: 'date-time' })
  @Transform(({ value }) => value.toISOString())
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  @Transform(({ value }) => value.toISOString())
  updatedAt: Date;

  constructor(partial: Partial<SpotifyConnectionResponseDto>) {
    Object.assign(this, partial);
  }
}
