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
    description: 'Lifetime in seconds of the access token',
    example: 3600,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  expiresIn: number;

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
