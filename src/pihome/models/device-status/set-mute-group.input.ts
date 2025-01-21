import { Field } from '@nestjs/graphql';

import { InputType } from '@nestjs/graphql';

@InputType()
export class SetMuteGroupInput {
  @Field(() => String)
  deviceGroupId: string;

  @Field(() => Boolean)
  isMuted: boolean;
}
