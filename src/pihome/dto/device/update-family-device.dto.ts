import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DeviceResponseDto } from '../device.dto';

export class UpdateFamilyDeviceRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;
}

export class UpdateFamilyDeviceResponseDto extends DeviceResponseDto {}
