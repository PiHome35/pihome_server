import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { FamilyResponseDto } from '../family.dto';

export class TransferFamilyOwnershipRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  newOwnerId: string;
}

export class TransferFamilyOwnershipResponseDto extends FamilyResponseDto {}
