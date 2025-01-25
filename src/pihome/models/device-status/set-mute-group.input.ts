import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
@InputType()
export class SetMuteGroupInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  deviceGroupId: string;

  @Field(() => Boolean)
  @IsNotEmpty()
  @IsBoolean()
  isMuted: boolean;
}
