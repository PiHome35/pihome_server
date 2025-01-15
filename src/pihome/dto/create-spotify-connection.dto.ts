import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class CreateSpotifyConnectionRequestDto {
  @ApiProperty({ description: 'Spotify access token', example: 'aksjdo3iwnvakh234siweuiruqp', required: true })
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @ApiProperty({ description: 'Spotify refresh token', example: 'aksjdo3iwnvakh234siweuiruqp', required: true })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @ApiProperty({
    description: 'Spotify access token expires at in Unix timestamp seconds',
    example: 1710729600,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  expiresAt: number;

  @ApiProperty({ description: 'Spotify device id', example: 'aksjdo3iwnvakh234siweuiruqp', required: true })
  @IsNotEmpty()
  @IsString()
  spotifyDeviceId: string;
}

export class CreateSpotifyConnectionResponseDto {
  @ApiProperty({ description: 'Spotify connection id', example: 'as213123123' })
  @IsNotEmpty()
  @IsString()
  id: string;
}
