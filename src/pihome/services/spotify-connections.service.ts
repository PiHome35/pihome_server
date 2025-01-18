import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Family, SpotifyConnection } from 'prisma/generated';
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
    spotifyDeviceId: string,
    userId: string,
  ): Promise<SpotifyConnection> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.familyId) {
      throw new BadRequestException('User is not in a family');
    }
    const spotifyConnection = await this.prisma.spotifyConnection.create({
      data: {
        accessToken,
        refreshToken,
        expiresIn,
        issuedAt: new Date(),
        spotifyDeviceId,
        familyId: user.familyId,
      },
    });
    return spotifyConnection;
  }

  async getSpotifyConnection(spotifyConnectionId: string): Promise<SpotifyConnection> {
    const spotifyConnection = await this.prisma.spotifyConnection.findUnique({
      where: { id: spotifyConnectionId },
    });
    if (!spotifyConnection) {
      throw new NotFoundException('Spotify connection not found');
    }
    return spotifyConnection;
  }

  async getSpotifyConnectionFamily(spotifyConnectionId: string): Promise<Family> {
    const spotifyConnection = await this.prisma.spotifyConnection.findUnique({
      where: { id: spotifyConnectionId },
      include: { family: true },
    });
    if (!spotifyConnection) {
      throw new NotFoundException('Spotify connection not found');
    }
    return spotifyConnection.family;
  }

  async deleteSpotifyConnection(spotifyConnectionId: string): Promise<void> {
    const spotifyConnection = await this.prisma.spotifyConnection.findUnique({
      where: { id: spotifyConnectionId },
    });
    if (!spotifyConnection) {
      throw new NotFoundException('Spotify connection not found');
    }
    await this.prisma.spotifyConnection.delete({ where: { id: spotifyConnectionId } });
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
