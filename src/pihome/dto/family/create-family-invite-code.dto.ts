import { ApiProperty } from '@nestjs/swagger';

export class CreateFamilyInviteCodeResponseDto {
  @ApiProperty()
  code: string;

  constructor(partial: Partial<CreateFamilyInviteCodeResponseDto>) {
    Object.assign(this, partial);
  }
}
