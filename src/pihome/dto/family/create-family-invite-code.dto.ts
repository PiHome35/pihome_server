import { ApiProperty } from '@nestjs/swagger';

export class CreateFamilyInviteCodeResponseDto {
  @ApiProperty()
  code: string;
}
