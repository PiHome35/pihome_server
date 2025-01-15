import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DefaultWakeWord } from '../constants/wake-word.constant';
import { DefaultChatModel } from '../constants/chat-model.constant';
import { PrismaService } from 'src/database/prisma.service';
import { DeviceGroup, Family } from 'prisma/generated';

@Injectable()
export class FamiliesService {
  constructor(private prisma: PrismaService) {}

  async createFamily(name: string, userId: string): Promise<Family> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { family: true } });
    if (!user) {
      throw new NotFoundException();
    }
    if (user.family) {
      throw new BadRequestException();
    }

    const family = await this.prisma.family.create({
      data: {
        name,
        chatModel: DefaultChatModel,
        wakeWord: DefaultWakeWord,
        ownerId: user.id,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { familyId: family.id },
    });

    return family;
  }

  async listFamilyDeviceGroups(familyId: string): Promise<DeviceGroup[]> {
    const deviceGroups = await this.prisma.deviceGroup.findMany({ where: { familyId } });
    return deviceGroups;
  }

  async getFamilyDefaultDeviceGroup(familyId: string): Promise<DeviceGroup> {
    const deviceGroup = await this.prisma.deviceGroup.findFirst({ where: { familyId, isDefault: true } });
    if (!deviceGroup) {
      throw new NotFoundException();
    }
    return deviceGroup;
  }
}
