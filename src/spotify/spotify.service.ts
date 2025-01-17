import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { SpotifyRefreshAccessTokenResponse } from './interfaces/spotify-api.interface';
import { RefreshAccessTokenResponse } from './interfaces/internal.interface';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SpotifyService {
  constructor(private readonly httpService: HttpService) {}

  async refreshAccessToken(refreshToken: string, clientId: string): Promise<RefreshAccessTokenResponse> {
    const { data } = await firstValueFrom(
      this.httpService.post<SpotifyRefreshAccessTokenResponse>(
        'https://accounts.spotify.com/api/token',
        {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: clientId,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      ),
    );

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      issuedAt: new Date(),
    };
  }
}
