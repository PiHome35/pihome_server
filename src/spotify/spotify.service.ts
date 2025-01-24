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

interface SpotifyToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  clientId: string;
}

@Injectable()
export class SpotifyService {
  private sdkSpotify: SpotifyApi;
  private tokenInfo: SpotifyToken | null = null;
  private readonly REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes before expiry

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async initializeSpotifyApi(familyId: string): Promise<void> {
    const spotifyConnection = await this.findTokenByFamilyId(familyId);
    console.log('spotifyConnection: ', spotifyConnection);
    console.log('this.configService.get("spotify.clientId")', this.configService.get('spotify.clientId'));
    console.log('this.configService.get("spotify.clientSecret")', this.configService.get('spotify.clientSecret'));

    const newRefreshToken = await this.refreshAccessToken(
      spotifyConnection.refreshToken,
      this.configService.get('spotify.clientId'),
      this.configService.get('spotify.clientSecret'),
    );
    this.sdkSpotify = SpotifyApi.withAccessToken(this.configService.get('spotify.clientId'), {
      access_token: newRefreshToken.accessToken,
      token_type: 'Bearer',
      expires_in: newRefreshToken.expiresIn,
      refresh_token: newRefreshToken.refreshToken,
    });
  }

  private async updateSpotifyApi(): Promise<void> {
    if (!this.tokenInfo) return;

    const accessToken: AccessToken = {
      access_token: this.tokenInfo.accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: this.tokenInfo.refreshToken,
    };

    this.sdkSpotify = SpotifyApi.withAccessToken(this.tokenInfo.clientId, accessToken);
    console.log('sdkSpotify: ', this.sdkSpotify);
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

  async searchTrack(query: string) {
    try {
      const result = await this.sdkSpotify.search(query, ['track']);
      return result;
    } catch (error) {
      if (error.message?.includes('Bad or expired token')) {
        return await this.sdkSpotify.search(query, ['track']);
      }
      throw error;
    }
  }

  async getFirstTrackUri(query: string): Promise<string | null> {
    try {
      const result = await this.sdkSpotify.search(query, ['track'], 'TH', 1);
      if (result.tracks.items.length > 0) {
        return result.tracks.items[0].uri;
      }
      return null;
    } catch (error) {
      if (error.message?.includes('Bad or expired token')) {
        return this.getFirstTrackUri(query);
      }
      throw error;
    }
  }

  async isPlaying(): Promise<boolean> {
    try {
      const playbackState = await this.sdkSpotify.player.getPlaybackState();
      return playbackState?.is_playing ?? false;
    } catch (error) {
      if (error.message?.includes('Bad or expired token')) {
        return this.isPlaying();
      }
      throw error;
    }
  }

  async getCurrentQueue() {
    try {
      return await this.sdkSpotify.player.getUsersQueue();
    } catch (error) {
      if (error.message?.includes('Bad or expired token')) {
        return this.getCurrentQueue();
      }
      throw error;
    }
  }

  async getAvailableDevices(): Promise<SpotifyDeviceDto[]> {
    try {
      await this.initializeSpotifyApi('1835bcd9-1bec-449e-a979-997ab8bf09cf');
      const devices = await this.sdkSpotify.player.getAvailableDevices();
      return devices.devices.map((device) => ({
        id: device.id,
        is_active: device.is_active,
        is_private_session: device.is_private_session,
        is_restricted: device.is_restricted,
        name: device.name,
        type: device.type,
        volume_percent: device.volume_percent,
      }));
    } catch (error) {
      if (error.message?.includes('Bad or expired token')) {
        console.log('Bad or expired token');
      }
      console.error('Failed to fetch Spotify devices:', error);
      throw new Error('Failed to fetch available Spotify devices');
    }
  }

  async playTrack(trackUri: string, deviceId?: string) {
    try {
      await this.sdkSpotify.player.startResumePlayback(deviceId, undefined, [trackUri]);
    } catch (error) {
      if (error.message?.includes('Bad or expired token')) {
        await this.playTrack(trackUri, deviceId);
      }
      throw error;
    }
  }

  async addToQueue(trackUri: string) {
    try {
      await this.sdkSpotify.player.addItemToPlaybackQueue(trackUri);
    } catch (error) {
      if (error.message?.includes('Bad or expired token')) {
        await this.addToQueue(trackUri);
      }
      throw error;
    }
  }

  async play(deviceId?: string) {
    try {
      await this.sdkSpotify.player.startResumePlayback(deviceId);
    } catch (error) {
      if (error.message?.includes('Bad or expired token')) {
        await this.play(deviceId);
      }
      throw error;
    }
  }

  async pause(deviceId?: string) {
    try {
      await this.sdkSpotify.player.pausePlayback(deviceId);
    } catch (error) {
      if (error.message?.includes('Bad or expired token')) {
        await this.pause(deviceId);
      }
      throw error;
    }
  }

  async next(deviceId?: string) {
    try {
      await this.sdkSpotify.player.skipToNext(deviceId);
    } catch (error) {
      if (error.message?.includes('Bad or expired token')) {
        await this.next(deviceId);
      }
      throw error;
    }
  }

  async previous(deviceId?: string) {
    try {
      await this.sdkSpotify.player.skipToPrevious(deviceId);
    } catch (error) {
      if (error.message?.includes('Bad or expired token')) {
        await this.previous(deviceId);
      }
      throw error;
    }
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
