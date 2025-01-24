import { ApiProperty } from '@nestjs/swagger';

export class SpotifyDeviceDto {
  @ApiProperty({
    description: 'The Spotify device ID',
    example: '1234567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'Whether this device is currently active',
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    description: 'Whether this device is in private session',
    example: false,
  })
  is_private_session: boolean;

  @ApiProperty({
    description: 'Whether this device has restricted access',
    example: false,
  })
  is_restricted: boolean;

  @ApiProperty({
    description: 'The name of the device',
    example: 'My iPhone',
  })
  name: string;

  @ApiProperty({
    description: 'The type of device (Computer, Smartphone, Speaker, etc.)',
    example: 'Smartphone',
  })
  type: string;

  @ApiProperty({
    description: 'The current volume level of the device (0-100)',
    example: 50,
    minimum: 0,
    maximum: 100,
  })
  volume_percent: number;
}

export class SpotifyDevicesResponseDto {
  @ApiProperty({
    description: 'List of available Spotify devices',
    type: [SpotifyDeviceDto],
  })
  devices: SpotifyDeviceDto[];
}
