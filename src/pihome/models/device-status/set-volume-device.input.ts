import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class SetVolumeDeviceInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  volumePercent: number;
}
