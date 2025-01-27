import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Device, DeviceGroup, Family } from '@prisma/client';
import { generateRandomSecret } from 'src/utils/random.util';
import * as argon2 from 'argon2';
import { DeviceStatus } from '../models/device-status/device-status.model';
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class DevicesService {
  constructor(
    private prisma: PrismaService,
    @Inject('PUB_SUB') private pubSub: PubSub,
  ) {}

  async createDevice(
    clientId: string,
    macAddress: string,
    name: string,
    familyId: string,
  ): Promise<{ device: Device; clientSecret: string }> {
    const family = await this.prisma.family.findUnique({
      where: { id: familyId },
      include: { devices: true },
    });
    if (!family) {
      throw new NotFoundException('Family not found');
    }
    if (await this.deviceExistsWithClientId(clientId)) {
      throw new BadRequestException('Device with this client id already exists');
    }
    const clientSecret = generateRandomSecret(32);
    const device = await this.prisma.device.create({
      data: {
        clientId,
        clientSecretHash: await argon2.hash(clientSecret),
        macAddress,
        name,
        isOn: true,
        isMuted: false,
        volumePercent: 100,
        isSoundServer: family.devices.length === 0,
        familyId,
      },
    });
    return { device, clientSecret };
  }

  async getDevice(deviceId: string): Promise<Device> {
    const device = await this.prisma.device.findUnique({ where: { id: deviceId } });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    return device;
  }

  async getDeviceByClientId(clientId: string): Promise<Device> {
    const device = await this.prisma.device.findUnique({ where: { clientId } });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    return device;
  }

  async getDeviceFamily(deviceId: string): Promise<Family> {
    const device = await this.prisma.device.findUnique({ where: { id: deviceId }, include: { family: true } });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    return device.family;
  }

  async getDeviceDeviceGroup(deviceId: string): Promise<DeviceGroup> {
    const device = await this.prisma.device.findUnique({ where: { id: deviceId }, include: { deviceGroup: true } });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    if (!device.deviceGroup) {
      throw new NotFoundException('Device is not in a device group');
    }
    return device.deviceGroup;
  }

  async listDevicesNotInDeviceGroup(familyId: string): Promise<Device[]> {
    const family = await this.prisma.family.findUnique({ where: { id: familyId }, include: { devices: true } });
    if (!family) {
      throw new NotFoundException('Family not found');
    }
    return family.devices.filter((device) => !device.deviceGroupId);
  }

  async updateDevice(deviceId: string, name?: string): Promise<Device> {
    const device = await this.prisma.device.findUnique({ where: { id: deviceId } });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    const updatedDevice = await this.prisma.device.update({ where: { id: deviceId }, data: { name } });
    return updatedDevice;
  }

  async deleteDevice(deviceId: string): Promise<void> {
    const device = await this.prisma.device.findUnique({ where: { id: deviceId } });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    // gracefully remove sound server status
    await this.prisma.device.update({ where: { id: deviceId }, data: { isSoundServer: false } });
    this.pubSub.publish('deviceStatusUpdated', { deviceStatusUpdated: new DeviceStatus(device) });
    // delete device
    await this.prisma.device.delete({ where: { id: deviceId } });
    await this.assignDeviceAsSoundServerIfAny(device.familyId);
  }

  async assignDeviceAsSoundServerIfAny(familyId: string): Promise<Device | null> {
    const existingSoundServer = await this.prisma.device.findFirst({ where: { familyId, isSoundServer: true } });
    if (existingSoundServer) {
      return existingSoundServer; // sound server already exists
    }
    const device = await this.prisma.device.findFirst({ where: { familyId } });
    if (!device) {
      return null; // no device to assign as sound server
    }
    await this.prisma.device.update({ where: { id: device.id }, data: { isSoundServer: true } });
    this.pubSub.publish('deviceStatusUpdated', { deviceStatusUpdated: new DeviceStatus(device) }); // only publish single device status update
    return device;
  }

  async deviceExistsWithClientId(clientId: string): Promise<boolean> {
    const device = await this.prisma.device.findUnique({ where: { clientId } });
    return !!device;
  }
}
