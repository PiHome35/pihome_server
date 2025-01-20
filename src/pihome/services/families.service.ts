import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DefaultChatModel } from '../constants/chat-model.constant';
import { PrismaService } from 'src/database/prisma.service';
import { Device, DeviceGroup, Family, SpotifyConnection, User } from '@prisma/client';
import { ChatModelKey } from '../constants/chat-model.constant';
import { generateRandomSecret } from 'src/utils/random.util';

@Injectable()
export class FamiliesService {
  constructor(private prisma: PrismaService) {}

  async createFamily(name: string, userId: string): Promise<Family> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.familyId) {
      throw new BadRequestException('User already belongs to a family');
    }
    const defaultChatModel = await this.prisma.chatModel.findUnique({ where: { key: DefaultChatModel } });
    if (!defaultChatModel) {
      throw new NotFoundException('Chat model not found');
    }
    const family = await this.prisma.family.create({
      data: {
        name,
        chatModelId: defaultChatModel.id,
        ownerId: user.id,
      },
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: { familyId: family.id },
    });
    return family;
  }

  async getFamily(familyId: string): Promise<Family> {
    const family = await this.prisma.family.findUnique({ where: { id: familyId } });
    if (!family) {
      throw new NotFoundException('Family not found');
    }
    return family;
  }

  async listFamilyUsers(familyId: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({ where: { familyId } });
    return users;
  }

  async listFamilyDeviceGroups(familyId: string): Promise<DeviceGroup[]> {
    const deviceGroups = await this.prisma.deviceGroup.findMany({ where: { familyId } });
    return deviceGroups;
  }

  async listFamilyDevices(familyId: string): Promise<Device[]> {
    const devices = await this.prisma.device.findMany({ where: { familyId } });
    return devices;
  }

  async getFamilySpotifyConnection(familyId: string): Promise<SpotifyConnection> {
    const spotifyConnection = await this.prisma.spotifyConnection.findFirst({ where: { familyId } });
    if (!spotifyConnection) {
      throw new NotFoundException('Family Spotify connection not found');
    }
    return spotifyConnection;
  }

  async updateFamily(familyId: string, name?: string, chatModelKey?: ChatModelKey): Promise<Family> {
    const family = await this.prisma.family.findUnique({ where: { id: familyId } });
    if (!family) {
      throw new NotFoundException('Family not found');
    }
    const chatModel = await this.prisma.chatModel.findUnique({ where: { key: chatModelKey } });
    if (!chatModel) {
      throw new NotFoundException('Chat model not found');
    }
    const updatedFamily = await this.prisma.family.update({
      where: { id: familyId },
      data: { name, chatModelId: chatModel.id },
    });
    return updatedFamily;
  }

  async deleteFamily(familyId: string): Promise<void> {
    const family = await this.prisma.family.findUnique({ where: { id: familyId } });
    if (!family) {
      throw new NotFoundException('Family not found');
    }
    await this.prisma.family.delete({ where: { id: familyId } });
  }

  async createFamilyInviteCode(familyId: string): Promise<string> {
    const family = await this.prisma.family.findUnique({ where: { id: familyId } });
    if (!family) {
      throw new NotFoundException('Family not found');
    }
    family.inviteCode = generateRandomSecret(4);
    await this.prisma.family.update({ where: { id: familyId }, data: { inviteCode: family.inviteCode } });
    return family.inviteCode;
  }

  async deleteFamilyInviteCode(familyId: string): Promise<void> {
    const family = await this.prisma.family.findUnique({ where: { id: familyId } });
    if (!family) {
      throw new NotFoundException('Family not found');
    }
    if (!family.inviteCode) {
      throw new BadRequestException('Family does not have an invite code');
    }
    await this.prisma.family.update({ where: { id: familyId }, data: { inviteCode: null } });
  }

  async transferFamilyOwnership(familyId: string, newOwnerId: string): Promise<void> {
    const family = await this.prisma.family.findUnique({ where: { id: familyId }, include: { users: true } });
    if (!family) {
      throw new NotFoundException('Family not found');
    }
    if (!family.users.some((user) => user.id === newOwnerId)) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.family.update({ where: { id: familyId }, data: { ownerId: newOwnerId } });
  }
}
