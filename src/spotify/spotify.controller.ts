import { Controller, Get, Post, Query, Param, Body } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { SpotifyDeviceDto } from 'src/pihome/dto/spotify/devices.response.dto';

@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('search')
  async searchTrack(@Query('familyId') familyId: string, @Query('query') query: string) {
    return this.spotifyService.searchTrack(familyId, query);
  }

  @Get('devices')
  async getDevices(@Query('familyId') familyId: string): Promise<SpotifyDeviceDto[]> {
    return this.spotifyService.getAvailableDevices(familyId);
  }

  @Get('queue')
  async getQueue(@Query('familyId') familyId: string): Promise<QueueResponse> {
    return this.spotifyService.getCurrentQueue(familyId);
  }

  @Get('is-playing')
  async isPlaying(@Query('familyId') familyId: string): Promise<boolean> {
    return this.spotifyService.isPlaying(familyId);
  }

  @Post('play')
  async play(@Query('familyId') familyId: string, @Query('deviceId') deviceId?: string) {
    return this.spotifyService.play(familyId, deviceId);
  }

  @Post('pause')
  async pause(@Query('familyId') familyId: string, @Query('deviceId') deviceId?: string) {
    return this.spotifyService.pause(familyId, deviceId);
  }

  @Post('next')
  async next(@Query('familyId') familyId: string, @Query('deviceId') deviceId?: string) {
    return this.spotifyService.next(familyId, deviceId);
  }

  @Post('previous')
  async previous(@Query('familyId') familyId: string, @Query('deviceId') deviceId?: string) {
    return this.spotifyService.previous(familyId, deviceId);
  }

  @Post('volume')
  async setVolume(
    @Query('familyId') familyId: string,
    @Query('volume') volume: number,
    @Query('deviceId') deviceId?: string,
  ) {
    return this.spotifyService.setVolume(familyId, volume, deviceId);
  }

  @Post('queue')
  async addToQueue(@Query('familyId') familyId: string, @Query('trackUri') trackUri: string) {
    return this.spotifyService.queueTrack(familyId, trackUri);
  }

  @Post('play-track')
  async playTrack(
    @Query('familyId') familyId: string,
    @Query('trackUri') trackUri: string,
    @Query('deviceId') deviceId?: string,
  ) {
    return this.spotifyService.playTrack(familyId, trackUri, deviceId);
  }

  @Post('transfer-playback')
  async transferPlayback(
    @Query('familyId') familyId: string,
    @Query('deviceId') deviceId: string,
    @Query('startPlayback') startPlayback?: boolean,
  ) {
    return this.spotifyService.transferPlayback(familyId, deviceId, startPlayback);
  }
}
