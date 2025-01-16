import { Injectable, NotFoundException } from '@nestjs/common';
import { DefaultVolumePercent } from '../constants/volume.constant';
import { PrismaService } from 'src/database/prisma.service';
import { Device } from 'prisma/generated';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  async createDevice(clientId: string, clientSecretHash: string, name: string, familyId: string): Promise<Device> {
    const family = await this.prisma.family.findUnique({ where: { id: familyId }, include: { devices: true } });
    if (!family) {
      throw new NotFoundException('Family not found');
    }

    const isSoundServer = family.devices.length === 0;

    const device = await this.prisma.device.create({
      data: {
        clientId,
        clientSecretHash,
        name,
        isOn: true,
        isMuted: false,
        volumePercent: DefaultVolumePercent,
        isSoundServer,
        familyId,
      },
    });
    return device;
  }

  async getDeviceByClientId(clientId: string): Promise<Device> {
    const device = await this.prisma.device.findUnique({ where: { clientId } });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    return device;
  }
}
