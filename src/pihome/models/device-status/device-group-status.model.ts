import { ObjectType, Field, ID } from '@nestjs/graphql';
import { DeviceStatus } from './device-status.model';

@ObjectType()
export class DeviceGroupStatus {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  isMuted: boolean;

  @Field((type) => [DeviceStatus])
  devices: DeviceStatus[];

  constructor(partial: Partial<DeviceGroupStatus>) {
    Object.assign(this, partial);
  }
}

@ObjectType()
export class DeviceGroupWithoutDevicesStatus {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  isMuted: boolean;

  constructor(partial: Partial<DeviceGroupWithoutDevicesStatus>) {
    Object.assign(this, partial);
  }
}
