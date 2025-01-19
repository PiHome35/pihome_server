import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFamilyDeviceGroupRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}
