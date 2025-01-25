import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DeviceStatus } from '../models/device-status/device-status.model';
import { DeviceGroupStatus } from '../models/device-status/device-group-status.model';
import { OverviewDeviceStatus } from '../models/device-status/overview-device-status.model';
import { PrismaService } from 'src/database/prisma.service';
import { PubSub } from 'graphql-subscriptions';
import { DevicesService } from './devices.service';
import { Device, DeviceGroup } from '@prisma/client';

@Injectable()
export class DeviceStatusService {
  private deviceHeartbeatTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private prisma: PrismaService,
    private devicesService: DevicesService,
    @Inject('PUB_SUB') private pubSub: PubSub,
  ) {}

  async getDeviceStatus(deviceId: string): Promise<DeviceStatus> {
    const device = await this.prisma.device.findUnique({ where: { id: deviceId } });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    return new DeviceStatus(device);
  }

  async getDeviceGroupStatus(deviceGroupId: string): Promise<DeviceGroupStatus> {
    const deviceGroup = await this.prisma.deviceGroup.findUnique({
      where: { id: deviceGroupId },
      include: { devices: true },
    });
    if (!deviceGroup) {
      throw new NotFoundException('Device group not found');
    }
    return new DeviceGroupStatus(deviceGroup);
  }

  async getOverviewDeviceStatus(familyId: string): Promise<OverviewDeviceStatus> {
    const family = await this.prisma.family.findUnique({
      where: { id: familyId },
      include: { deviceGroups: true },
    });
    if (!family) {
      throw new NotFoundException('Family not found');
    }
    const standAloneDevices = await this.devicesService.listDevicesNotInDeviceGroup(familyId);
    return new OverviewDeviceStatus({ familyId, deviceGroups: family.deviceGroups, standAloneDevices });
  }

  async publishAffectedStatusUpdatesByDevice(deviceId: string, statusCascadesToGroup: boolean) {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
      include: { deviceGroup: { include: { devices: true } } },
    });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    this.pubSub.publish('deviceStatusUpdated', { deviceStatusUpdated: new DeviceStatus(device) });
    if (device.deviceGroup) {
      // DeviceGroupStatus contains all member devices' statuses,
      // so the group status needs to be published regardless of statusCascadesToGroup
      this.pubSub.publish('deviceGroupStatusUpdated', {
        deviceGroupStatusUpdated: new DeviceGroupStatus(device.deviceGroup),
      });
    }
    if (!device.deviceGroup || statusCascadesToGroup) {
      // Status viewable in the overview page
      const deviceGroups = await this.prisma.deviceGroup.findMany({ where: { familyId: device.familyId } });
      const standAloneDevices = await this.devicesService.listDevicesNotInDeviceGroup(device.familyId);
      this.pubSub.publish('overviewDeviceStatusUpdated', {
        overviewDeviceStatusUpdated: new OverviewDeviceStatus({
          familyId: device.familyId,
          deviceGroups,
          standAloneDevices,
        }),
      });
    }
  }

  async publishAffectedStatusUpdatesByDeviceGroup(deviceGroupId: string) {
    const deviceGroup = await this.prisma.deviceGroup.findUnique({
      where: { id: deviceGroupId },
      include: { devices: true },
    });
    if (!deviceGroup) {
      throw new NotFoundException('Device group not found');
    }
    // DeviceGroupStatus
    this.pubSub.publish('deviceGroupStatusUpdated', {
      deviceGroupStatusUpdated: new DeviceGroupStatus(deviceGroup),
    });
    // DeviceStatus
    deviceGroup.devices.forEach((device) => {
      this.pubSub.publish('deviceStatusUpdated', { deviceStatusUpdated: new DeviceStatus(device) });
    });
    // OverviewDeviceStatus
    const deviceGroups = await this.prisma.deviceGroup.findMany({ where: { familyId: deviceGroup.familyId } });
    const standAloneDevices = await this.devicesService.listDevicesNotInDeviceGroup(deviceGroup.familyId);
    this.pubSub.publish('overviewDeviceStatusUpdated', {
      overviewDeviceStatusUpdated: new OverviewDeviceStatus({
        familyId: deviceGroup.familyId,
        deviceGroups,
        standAloneDevices,
      }),
    });
  }

  async setDeviceMuted(deviceId: string, isMuted: boolean): Promise<Device> {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
      include: { deviceGroup: { include: { devices: true } } },
    });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    const updatedDevice = await this.prisma.device.update({
      where: { id: deviceId },
      data: { isMuted },
    });
    if (device.deviceGroup) {
      // if the device was set isMuted = true, cascade mute to device group if all devices in group are muted
      if (isMuted && device.deviceGroup.devices.every((device) => device.isMuted === true)) {
        await this.prisma.deviceGroup.update({
          where: { id: device.deviceGroup.id },
          data: { isMuted: true },
        });
      } else if (!isMuted) {
        // if the device was set isMuted = false, cascade unmute to device group
        await this.prisma.deviceGroup.update({
          where: { id: device.deviceGroup.id },
          data: { isMuted: false },
        });
      }
    }
    // publish affected status updates
    await this.publishAffectedStatusUpdatesByDevice(deviceId, true);
    return updatedDevice;
  }

  async setDeviceVolume(deviceId: string, volumePercent: number): Promise<Device> {
    const device = await this.prisma.device.findUnique({ where: { id: deviceId } });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    const updatedDevice = await this.prisma.device.update({
      where: { id: deviceId },
      data: { volumePercent },
    });
    // publish affected status updates
    await this.publishAffectedStatusUpdatesByDevice(deviceId, false);
    return updatedDevice;
  }

  async receiveDeviceHeartbeat(deviceId: string): Promise<Device> {
    const device = await this.prisma.device.update({ where: { id: deviceId }, data: { isOn: true } });
    if (this.deviceHeartbeatTimeouts.has(deviceId)) {
      clearTimeout(this.deviceHeartbeatTimeouts.get(deviceId));
      this.deviceHeartbeatTimeouts.delete(deviceId);
    } else {
      // device comes online after being offline, or device reports heartbeat for the first time
      // publish affected status updates
      await this.publishAffectedStatusUpdatesByDevice(deviceId, false);
    }
    this.deviceHeartbeatTimeouts.set(
      deviceId,
      setTimeout(() => {
        this.markDeviceAsOffline(deviceId);
      }, 1000 * 60),
    );
    return device;
  }

  async markDeviceAsOffline(deviceId: string): Promise<void> {
    const device = await this.prisma.device.update({ where: { id: deviceId }, data: { isOn: false } });
    this.deviceHeartbeatTimeouts.delete(deviceId);
    // device goes offline, publish affected status updates
    await this.publishAffectedStatusUpdatesByDevice(deviceId, false);
  }

  async setDeviceGroupMuted(deviceGroupId: string, isMuted: boolean): Promise<DeviceGroup & { devices: Device[] }> {
    const deviceGroup = await this.prisma.deviceGroup.findUnique({
      where: { id: deviceGroupId },
      include: { devices: true },
    });
    if (!deviceGroup) {
      throw new NotFoundException('Device group not found');
    }
    for (const device of deviceGroup.devices) {
      await this.setDeviceMuted(device.id, isMuted);
    }
    const updatedDeviceGroup = await this.prisma.deviceGroup.findUnique({
      where: { id: deviceGroupId },
      include: { devices: true },
    });
    await this.publishAffectedStatusUpdatesByDeviceGroup(deviceGroupId);
    return updatedDeviceGroup;
  }
}
