import { Controller, Get, Post, Query, Body, Param, UseGuards, Req } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { SpotifyDeviceDto } from 'src/pihome/dto/spotify/devices.response.dto';
import { UserLocalAuthGuard } from 'src/auth/guards/user-local-auth.guard';
import { ClientContext } from 'src/auth/interfaces/context.interface';

@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @UseGuards(UserLocalAuthGuard)
  @Get('test/search')
  async testSearch(@Query('query') query: string, @Req() req: any) {
    const currentUser = req.user as ClientContext;
    return await this.spotifyService.searchTrack(query);
  }

  @UseGuards(UserLocalAuthGuard)
  @Get('test/first-track')
  async testFirstTrack(@Query('query') query: string, @Req() req: any) {
    const currentUser = req.user as ClientContext;
    return await this.spotifyService.getFirstTrackUri(query);
  }

  @UseGuards(UserLocalAuthGuard)
  @Get('test/playback-state')
  async testPlaybackState(@Req() req: any) {
    const currentUser = req.user as ClientContext;
    return await this.spotifyService.isPlaying();
  }

  @UseGuards(UserLocalAuthGuard)
  @Get('test/queue')
  async testQueue(@Req() req: any) {
    const currentUser = req.user as ClientContext;
    return await this.spotifyService.getCurrentQueue();
  }

  @Public()
  // @UseGuards(UserLocalAuthGuard)
  @Get('test/devices')
  async testDevices(@Req() req: any): Promise<SpotifyDeviceDto[]> {
    return await this.spotifyService.getAvailableDevices();
  }

  @UseGuards(UserLocalAuthGuard)
  @Post('test/play-track')
  async testPlayTrack(@Body('trackUri') trackUri: string, @Req() req: any) {
    const currentUser = req.user as ClientContext;
    return await this.spotifyService.playTrack(trackUri);
  }

  @UseGuards(UserLocalAuthGuard)
  @Post('test/queue/add')
  async testAddToQueue(@Body('trackUri') trackUri: string, @Req() req: any) {
    const currentUser = req.user as ClientContext;
    return await this.spotifyService.addToQueue(trackUri);
  }

  @UseGuards(UserLocalAuthGuard)
  @Post('test/playback/play')
  async testPlay(@Req() req: any, @Body('deviceId') deviceId?: string) {
    const currentUser = req.user as ClientContext;
    return await this.spotifyService.play(deviceId);
  }

  @UseGuards(UserLocalAuthGuard)
  @Post('test/playback/pause')
  async testPause(@Req() req: any, @Body('deviceId') deviceId?: string) {
    const currentUser = req.user as ClientContext;
    return await this.spotifyService.pause(deviceId);
  }
}
