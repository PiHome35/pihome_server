import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SetMuteDeviceInput {
  @Field(() => String)
  deviceId: string;

  @Field(() => Boolean)
  isMuted: boolean;
}
