import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateFamilySpotifyConnectionRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @ApiProperty()
  @IsString()
  spotifyDeviceId: string;
}
