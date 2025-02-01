import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  SpotifyRefreshAccessTokenRequest,
  SpotifyRefreshAccessTokenResponse,
} from './interfaces/spotify-web-api/auth.interface';
import { RefreshAccessTokenResponse } from './interfaces/internal/auth.interface';
import { SpotifyApi, AccessToken, AuthenticationResponse } from '@spotify/web-api-ts-sdk';
import { ConfigService } from '@nestjs/config';
import { SpotifyDeviceDto } from 'src/pihome/dto/spotify/devices.response.dto';
import { PrismaService } from 'src/database/prisma.service';
import { Device } from '@prisma/client';

interface SpotifyToken {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class SpotifyService {
  private sdkSpotify: SpotifyApi;

  private isTokenExpired(issuedAt: Date): boolean {
    const oneHour = 3600 * 1000; // 3600 seconds * 1000 to get milliseconds
    const expirationTime = new Date(issuedAt.getTime() + oneHour);
    // Add a 5-minute buffer to refresh token before it actually expires
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return new Date() >= new Date(expirationTime.getTime() - bufferTime);
  }

  private async executeWithTokenRefresh<T>(operation: () => Promise<T>, familyId: string): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error.message?.includes('Bad or expired token')) {
        await this.initializeSpotifyApi(familyId);
        return await operation();
      }
      throw error;
    }
  }

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async initializeSpotifyApi(familyId: string): Promise<void> {
    const spotifyConnection = await this.findTokenByFamilyId(familyId);
    if (this.isTokenExpired(spotifyConnection.issuedAt)) {
      const newToken = await this.refreshAccessToken(
        spotifyConnection.refreshToken,
        this.configService.get('spotify.clientId'),
        this.configService.get('spotify.clientSecret'),
      );
      await this.updateTokenInDatabase(
        {
          accessToken: newToken.accessToken,
          refreshToken: newToken.refreshToken || spotifyConnection.refreshToken,
        },
        newToken.issuedAt,
      );
      this.sdkSpotify = SpotifyApi.withAccessToken(this.configService.get('spotify.clientId'), {
        access_token: newToken.accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: newToken.refreshToken || spotifyConnection.refreshToken,
      });
    } else {
      this.sdkSpotify = SpotifyApi.withAccessToken(this.configService.get('spotify.clientId'), {
        access_token: spotifyConnection.accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: spotifyConnection.refreshToken,
      });
    }
  }

  private async updateTokenInDatabase(tokenInfo: SpotifyToken, issuedAt: Date): Promise<void> {
    await this.prisma.spotifyConnection.updateMany({
      where: {
        refreshToken: tokenInfo.refreshToken,
      },
      data: {
        accessToken: tokenInfo.accessToken,
        refreshToken: tokenInfo.refreshToken,
        issuedAt: issuedAt,
      },
    });
  }

  async searchTrack(familyId: string, query: string) {
    await this.initializeSpotifyApi(familyId);
    return this.executeWithTokenRefresh(() => this.sdkSpotify.search(query, ['track']), familyId);
  }

  async getFirstTrackUri(familyId: string, query: string): Promise<string | null> {
    await this.initializeSpotifyApi(familyId);
    const result = await this.executeWithTokenRefresh(
      () => this.sdkSpotify.search(query, ['track'], 'TH', 1),
      familyId,
    );
    if (result.tracks.items.length > 0) {
      return result.tracks.items[0].uri;
    }
    return null;
  }

  async isPlaying(familyId: string): Promise<boolean> {
    await this.initializeSpotifyApi(familyId);
    const playbackState = await this.executeWithTokenRefresh(() => this.sdkSpotify.player.getPlaybackState(), familyId);
    return playbackState?.is_playing ?? false;
  }

  async getCurrentQueue(familyId: string) {
    await this.initializeSpotifyApi(familyId);
    return this.executeWithTokenRefresh(() => this.sdkSpotify.player.getUsersQueue(), familyId);
  }

  async getAvailableDevices(familyId: string): Promise<SpotifyDeviceDto[]> {
    await this.initializeSpotifyApi(familyId);
    const devices = await this.executeWithTokenRefresh(() => this.sdkSpotify.player.getAvailableDevices(), familyId);
    return devices.devices.map((device) => ({
      id: device.id,
      is_active: device.is_active,
      is_private_session: device.is_private_session,
      is_restricted: device.is_restricted,
      name: device.name,
      type: device.type,
      volume_percent: device.volume_percent,
    }));
  }

  async playTrack(familyId: string, trackUri: string, deviceId?: string) {
    await this.initializeSpotifyApi(familyId);
    await this.executeWithTokenRefresh(
      () => this.sdkSpotify.player.startResumePlayback(deviceId, undefined, [trackUri]),
      familyId,
    );
  }

  async queueTrack(familyId: string, trackUri: string) {
    await this.initializeSpotifyApi(familyId);
    await this.executeWithTokenRefresh(() => this.sdkSpotify.player.addItemToPlaybackQueue(trackUri), familyId);
  }

  async seeQueue(familyId: string) {
    await this.initializeSpotifyApi(familyId);
    const queue = await this.executeWithTokenRefresh(() => this.sdkSpotify.player.getUsersQueue(), familyId);
    console.log('queue', queue);
  }

  async play(familyId: string, deviceId?: string) {
    await this.initializeSpotifyApi(familyId);
    const contextUri = await this.getCurrentlyPlayingTrackUri(familyId);
    try {
      const response = await this.executeWithTokenRefresh(
        () => this.sdkSpotify.player.startResumePlayback(deviceId),
        familyId,
      );
    } catch (error) {
      console.log('error play', error);
    }
  }

  async pause(familyId: string, deviceId?: string) {
    await this.initializeSpotifyApi(familyId);
    // const contextUri = await this.getCurrentlyPlayingTrackUri(familyId);
    try {
      const response = await this.executeWithTokenRefresh(
        () => this.sdkSpotify.player.pausePlayback(deviceId),
        familyId,
      );
    } catch (error) {
      console.log('error pause', error);
    }
  }

  async next(familyId: string, deviceId?: string) {
    await this.initializeSpotifyApi(familyId);
    await this.executeWithTokenRefresh(() => this.sdkSpotify.player.skipToNext(deviceId), familyId);
  }

  async previous(familyId: string, deviceId?: string) {
    await this.initializeSpotifyApi(familyId);
    await this.executeWithTokenRefresh(() => this.sdkSpotify.player.skipToPrevious(deviceId), familyId);
  }

  async getCurrentlyPlayingTrackUri(familyId: string): Promise<string | null> {
    await this.initializeSpotifyApi(familyId);
    const result = await this.executeWithTokenRefresh(
      () => this.sdkSpotify.player.getCurrentlyPlayingTrack(),
      familyId,
    );
    return result['item']['uri'];
  }

  async getSongName(familyId: string, trackUri: string): Promise<string> {
    await this.initializeSpotifyApi(familyId);
    const track = await this.sdkSpotify.tracks.get(trackUri);
    return track.name;
  }

  async getArtists(familyId: string, trackUri: string): Promise<string[]> {
    await this.initializeSpotifyApi(familyId);
    const track = await this.sdkSpotify.tracks.get(trackUri);
    console.log('track', track);
    return track.artists.map((artist) => artist.name);
  }

  async getSpotifyDeviceId(familyId: string): Promise<string | null> {
    await this.initializeSpotifyApi(familyId);
    const devices = await this.executeWithTokenRefresh(() => this.sdkSpotify.player.getAvailableDevices(), familyId);
    console.log('[getSpotifyDeviceId] devices: ', devices);
    for (const device of devices.devices) {
      if (device.name == 'PiHome') {
        return device.id;
      }
    }
    return null;
  }

  async refreshAccessToken(
    refreshToken: string,
    clientId: string,
    clientSecret: string,
  ): Promise<RefreshAccessTokenResponse> {
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const { data } = await firstValueFrom(
      this.httpService.post<SpotifyRefreshAccessTokenResponse>(
        'https://accounts.spotify.com/api/token',
        {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: clientId,
        } as SpotifyRefreshAccessTokenRequest,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${authHeader}`,
          },
        },
      ),
    );
    console.log('[refreshAccessToken] data: ', data);
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      issuedAt: new Date(),
    };
  }

  async findTokenByFamilyId(familyId: string) {
    const spotifyConnection = await this.prisma.spotifyConnection.findFirst({
      where: {
        familyId,
      },
    });
    return spotifyConnection;
  }
}
