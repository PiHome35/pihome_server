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
    userId: string,
  ): Promise<SpotifyConnection> {
    const family = await this.prisma.family.findFirst({
      where: { users: { some: { id: userId } } },
      include: { users: true },
    });
    if (!family) {
      throw new NotFoundException();
    }

    const spotifyConnection = await this.prisma.spotifyConnection.create({
      data: {
        accessToken,
        refreshToken,
        spotifyDeviceId,
        expiresAt,
        familyId: family.id,
        ownerId: userId,
      },
    });
    return spotifyConnection;
  }
}
