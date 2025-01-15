import { Injectable, NotFoundException } from '@nestjs/common';
import { SpotifyConnection } from 'prisma/generated';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class SpotifyConnectionsService {
  constructor(private prisma: PrismaService) {}
  async createSpotifyConnection(
    accessToken: string,
    refreshToken: string,
    expiresAt: Date,
    spotifyDeviceId: string,
    familyId: string,
    userId: string,
  ): Promise<SpotifyConnection> {
    const user = await this.prisma.user.findUnique({ where: { id: userId, familyId }, include: { family: true } });
    if (!user) {
      throw new NotFoundException();
    }

    const spotifyConnection = await this.prisma.spotifyConnection.create({
      data: {
        accessToken,
        refreshToken,
        spotifyDeviceId,
        expiresAt,
        familyId: user.familyId,
        ownerId: user.id,
      },
    });
    return spotifyConnection;
  }
}
