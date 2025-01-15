import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DefaultVolumePercent } from '../constants/volume.constant';
import { PrismaService } from 'src/database/prisma.service';
import { Device } from 'prisma/generated';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  async createDevice(
    clientId: string,
    clientSecretHash: string,
    name: string,
    familyId: string,
    deviceGroupId: string,
  ): Promise<Device> {
    const family = await this.prisma.family.findUnique({
      where: { id: familyId, deviceGroups: { some: { id: deviceGroupId } } },
      include: { deviceGroups: true },
    });
    if (!family) {
      throw new BadRequestException();
    }

    const device = await this.prisma.device.create({
      data: {
        clientId,
        clientSecretHash,
        name,
        isOn: true,
        volumePercent: DefaultVolumePercent,
        familyId: family.id,
        deviceGroupId,
      },
    });
    return device;
  }

  async getDeviceByClientId(clientId: string): Promise<Device> {
    const device = await this.prisma.device.findUnique({ where: { clientId } });
    if (!device) {
      throw new NotFoundException();
    }
    return device;
  }
}
