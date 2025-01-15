import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { DeviceGroup } from 'prisma/generated';

@Injectable()
export class DeviceGroupsService {
  constructor(private prisma: PrismaService) {}

  async createDeviceGroup(name: string, familyId: string, isDefault: boolean = false): Promise<DeviceGroup> {
    const family = await this.prisma.family.findUnique({ where: { id: familyId } });
    if (!family) {
      throw new NotFoundException('Family not found');
    }

    const deviceGroup = await this.prisma.deviceGroup.create({
      data: {
        name,
        isDefault,
        isMuted: false,
        familyId: family.id,
      },
    });
    return deviceGroup;
  }

  async getDeviceGroup(deviceGroupId: string): Promise<DeviceGroup> {
    const deviceGroup = await this.prisma.deviceGroup.findUnique({ where: { id: deviceGroupId } });
    if (!deviceGroup) {
      throw new NotFoundException('Device group not found');
    }
    return deviceGroup;
  }
}
