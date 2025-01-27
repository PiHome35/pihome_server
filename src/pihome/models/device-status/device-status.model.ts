import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class DeviceStatus {
  @Field(() => ID)
  id: string;

  @Field()
  macAddress: string;

  @Field()
  name: string;

  @Field()
  isOn: boolean;

  @Field()
  isMuted: boolean;

  @Field((type) => Int)
  volumePercent: number;

  @Field()
  isSoundServer: boolean;

  constructor(partial: Partial<DeviceStatus>) {
    Object.assign(this, partial);
  }
}
