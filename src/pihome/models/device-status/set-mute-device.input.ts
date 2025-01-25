import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class SetMuteDeviceInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @Field(() => Boolean)
  @IsNotEmpty()
  @IsBoolean()
  isMuted: boolean;
}
