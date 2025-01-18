import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { SpotifyConnectionResponseDto } from '../spotify-connection.dto';

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
  @IsNotEmpty()
  @IsInt()
  expiresIn: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  spotifyDeviceId: string;
}

export class CreateFamilySpotifyConnectionResponseDto extends SpotifyConnectionResponseDto {}
