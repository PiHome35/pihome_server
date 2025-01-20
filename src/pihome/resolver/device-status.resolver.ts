import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { DeviceStatus } from '../models/device-status/device-status.model';
import { DeviceGroupStatus } from '../models/device-status/device-group-status.model';
import { PubSub } from 'graphql-subscriptions';
import { Inject } from '@nestjs/common';
import { SetMuteDeviceInput } from '../inputs/device-status/set-mute-device.input';
import { SetVolumeDeviceInput } from '../inputs/device-status/set-volume-device.input';
import { DeviceStatusService } from '../services/device-status.service';
import { OverviewDeviceStatus } from '../models/device-status/overview-device-status.model';
import { SetMuteGroupInput } from '../inputs/device-status/set-mute-group.input';

@Resolver()
export class DeviceStatusResolver {
  constructor(
    private deviceStatusService: DeviceStatusService,
    @Inject('PUB_SUB') private pubSub: PubSub,
  ) {}

  @Query(() => DeviceStatus)
  async getDeviceStatus(@Args('deviceId') deviceId: string) {
    return this.deviceStatusService.getDeviceStatus(deviceId);
  }

  @Mutation(() => DeviceStatus)
  async setDeviceMuted(@Args('input') input: SetMuteDeviceInput): Promise<DeviceStatus> {
    return this.deviceStatusService.setDeviceMuted(input.deviceId, input.isMuted);
  }

  @Mutation(() => DeviceStatus)
  async setDeviceVolume(@Args('input') input: SetVolumeDeviceInput): Promise<DeviceStatus> {
    return this.deviceStatusService.setDeviceVolume(input.deviceId, input.volumePercent);
  }

  @Subscription(() => DeviceStatus)
  deviceStatusUpdated() {
    return this.pubSub.asyncIterableIterator('deviceStatusUpdated');
  }

  @Query(() => DeviceGroupStatus)
  async getDeviceGroupStatus(@Args('deviceGroupId') deviceGroupId: string) {
    return this.deviceStatusService.getDeviceGroupStatus(deviceGroupId);
  }

  @Mutation(() => DeviceGroupStatus)
  async setDeviceGroupMuted(@Args('input') input: SetMuteGroupInput): Promise<DeviceGroupStatus> {
    return this.deviceStatusService.setDeviceGroupMuted(input.deviceGroupId, input.isMuted);
  }

  @Subscription(() => DeviceGroupStatus)
  deviceGroupStatusUpdated() {
    return this.pubSub.asyncIterableIterator('deviceGroupStatusUpdated');
  }

  @Query(() => OverviewDeviceStatus)
  async getOverviewDeviceStatus(@Args('familyId') familyId: string) {
    return this.deviceStatusService.getOverviewDeviceStatus(familyId);
  }

  @Subscription(() => OverviewDeviceStatus)
  overviewDeviceStatusUpdated() {
    return this.pubSub.asyncIterableIterator('overviewDeviceStatusUpdated');
  }
}
