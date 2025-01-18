import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { DeviceGroupResponseDto } from '../device-group.dto';

export class CreateFamilyDeviceGroupRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class CreateFamilyDeviceGroupResponseDto extends DeviceGroupResponseDto {}
