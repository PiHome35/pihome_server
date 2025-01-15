import { Injectable, NotFoundException } from '@nestjs/common';
import { DefaultVolumePercent } from '../constants/volume.constant';
import { PrismaService } from 'src/database/prisma.service';
import { Device } from 'prisma/generated';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  async createDevice(clientId: string, clientSecretHash: string, name: string, deviceGroupId: string): Promise<Device> {
    const deviceGroup = await this.prisma.deviceGroup.findUnique({ where: { id: deviceGroupId } });
    if (!deviceGroup) {
      throw new NotFoundException();
    }

    const device = await this.prisma.device.create({
      data: {
        clientId,
        clientSecretHash,
        name,
        isOn: true,
        volumePercent: DefaultVolumePercent,
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
