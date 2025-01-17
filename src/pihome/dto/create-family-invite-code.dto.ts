import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFamilyInviteCodeResponseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;
}
