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

  @ApiProperty()
  @Transform(({ value }) => value.toISOString())
  issuedAt: string;

  @ApiProperty()
  spotifyDeviceId: string;

  @ApiProperty()
  familyId: string;

  @ApiProperty()
  @Transform(({ value }) => value.toISOString())
  createdAt: Date;

  @ApiProperty({ nullable: true })
  @Transform(({ value }) => (value ? value.toISOString() : null))
  updatedAt: Date | null;
}
