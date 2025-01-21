import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class SetVolumeDeviceInput {
  @Field(() => String)
  deviceId: string;

  @Field(() => Int)
  volumePercent: number;
}
