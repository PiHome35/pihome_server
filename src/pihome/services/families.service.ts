import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DefaultWakeWord } from '../constants/wake-word.constant';
import { DefaultChatModel } from '../constants/chat-model.constant';
import { PrismaService } from 'src/database/prisma.service';
import { DeviceGroup, Family } from 'prisma/generated';
import { generateRandomSecret } from 'src/utils/random.util';
import { CreateFamilyInviteCodeResponseDto } from '../dto/create-family-invite-code.dto';

@Injectable()
export class FamiliesService {
  constructor(private prisma: PrismaService) {}

  async createFamily(name: string, userId: string): Promise<Family> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { family: true } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.family) {
      throw new BadRequestException('User already has a family');
    }

    const family = await this.prisma.family.create({
      data: {
        name,
        chatModel: DefaultChatModel,
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

  async createFamilyInviteCode(familyId: string): Promise<string> {
    const family = await this.prisma.family.findUnique({ where: { id: familyId } });
    if (!family) {
      throw new NotFoundException('Family not found');
    }
    family.inviteCode = generateRandomSecret(4);
    return family.inviteCode;
  }

  async deleteFamilyInviteCode(familyId: string): Promise<void> {
    await this.prisma.family.update({ where: { id: familyId }, data: { inviteCode: null } });
  }
}
