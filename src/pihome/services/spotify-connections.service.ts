import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SpotifyConnection } from 'prisma/generated';
import { PrismaService } from 'src/database/prisma.service';
import { SpotifyService } from 'src/spotify/spotify.service';

@Injectable()
export class SpotifyConnectionsService {
  constructor(
    private prisma: PrismaService,
    private spotifyService: SpotifyService,
    private configService: ConfigService,
  ) {}

  async createSpotifyConnection(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    issuedAt: Date,
    spotifyDeviceId: string,
    userId: string,
  ): Promise<SpotifyConnection> {
    const family = await this.prisma.family.findFirst({
      where: { users: { some: { id: userId } } },
      include: { users: true },
    });
    if (!family) {
      throw new NotFoundException('Family not found');
    }

    const spotifyConnection = await this.prisma.spotifyConnection.create({
      data: {
        accessToken,
        refreshToken,
        expiresIn,
        issuedAt,
        spotifyDeviceId,
        familyId: family.id,
      },
    });
    return spotifyConnection;
  }

  async refreshSpotifyConnection(spotifyConnectionId: string): Promise<SpotifyConnection> {
    const spotifyConnection = await this.prisma.spotifyConnection.findUnique({
      where: { id: spotifyConnectionId },
    });
    if (!spotifyConnection) {
      throw new NotFoundException('Spotify connection not found');
    }

    const { accessToken, refreshToken, expiresIn, issuedAt } = await this.spotifyService.refreshAccessToken(
      spotifyConnection.refreshToken,
      this.configService.get('spotify.clientId'),
    );

    const updatedSpotifyConnection = await this.prisma.spotifyConnection.update({
      where: { id: spotifyConnectionId },
      data: { accessToken, refreshToken, expiresIn, issuedAt },
    });

    return updatedSpotifyConnection;
  }
}
