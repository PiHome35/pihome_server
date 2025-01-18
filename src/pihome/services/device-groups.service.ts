import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Device, DeviceGroup, Family } from 'prisma/generated';

@Injectable()
export class DeviceGroupsService {
  constructor(private prisma: PrismaService) {}

  async createDeviceGroup(name: string, familyId: string): Promise<DeviceGroup> {
    const family = await this.prisma.family.findUnique({ where: { id: familyId } });
    if (!family) {
      throw new NotFoundException('Family not found');
    }
    const deviceGroup = await this.prisma.deviceGroup.create({
      data: {
        name,
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

  async getDeviceGroupFamily(deviceGroupId: string): Promise<Family> {
    const deviceGroup = await this.prisma.deviceGroup.findUnique({
      where: { id: deviceGroupId },
      include: { family: true },
    });
    if (!deviceGroup) {
      throw new NotFoundException('Device group not found');
    }
    return deviceGroup.family;
  }

  async listDeviceGroupDevices(deviceGroupId: string): Promise<Device[]> {
    const devices = await this.prisma.device.findMany({ where: { deviceGroupId } });
    return devices;
  }

  async updateDeviceGroup(deviceGroupId: string, name?: string): Promise<DeviceGroup> {
    const deviceGroup = await this.prisma.deviceGroup.findUnique({ where: { id: deviceGroupId } });
    if (!deviceGroup) {
      throw new NotFoundException('Device group not found');
    }
    const updatedDeviceGroup = await this.prisma.deviceGroup.update({ where: { id: deviceGroupId }, data: { name } });
    return updatedDeviceGroup;
  }

  async deleteDeviceGroup(deviceGroupId: string): Promise<void> {
    const deviceGroup = await this.prisma.deviceGroup.findUnique({ where: { id: deviceGroupId } });
    if (!deviceGroup) {
      throw new NotFoundException('Device group not found');
    }
    await this.prisma.deviceGroup.delete({ where: { id: deviceGroupId } });
  }

  async addDevicesToDeviceGroup(deviceGroupId: string, deviceIds: string[]): Promise<void> {
    const deviceGroup = await this.prisma.deviceGroup.findUnique({ where: { id: deviceGroupId } });
    if (!deviceGroup) {
      throw new NotFoundException('Device group not found');
    }
    for (const deviceId of deviceIds) {
      const device = await this.prisma.device.findUnique({ where: { id: deviceId } });
      if (!device) {
        throw new NotFoundException('Device(s) not found');
      }
    }
    await this.prisma.device.updateMany({ where: { id: { in: deviceIds } }, data: { deviceGroupId } });
  }

  async removeDevicesFromAnyDeviceGroup(deviceIds: string[]): Promise<void> {
    for (const deviceId of deviceIds) {
      const device = await this.prisma.device.findUnique({ where: { id: deviceId } });
      if (!device) {
        throw new NotFoundException('Device(s) not found');
      }
    }
    await this.prisma.device.updateMany({ where: { id: { in: deviceIds } }, data: { deviceGroupId: null } });
  }
}
