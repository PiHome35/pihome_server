import { ObjectType, Field } from '@nestjs/graphql';
import { DeviceGroupWithoutDevicesStatus } from './device-group-status.model';
import { DeviceStatus } from './device-status.model';

@ObjectType()
export class OverviewDeviceStatus {
  @Field(() => [DeviceGroupWithoutDevicesStatus])
  deviceGroups: DeviceGroupWithoutDevicesStatus[];

  @Field(() => [DeviceStatus])
  standAloneDevices: DeviceStatus[];

  constructor(partial: Partial<OverviewDeviceStatus>) {
    Object.assign(this, partial);
  }
}
