import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DeviceGroupResponseDto } from '../device-group.dto';

export class UpdateFamilyDeviceGroupRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;
}

export class UpdateFamilyDeviceGroupResponseDto extends DeviceGroupResponseDto {}
