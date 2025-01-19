import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TransferFamilyOwnershipRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  newOwnerId: string;
}
