import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class FamilyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  chatModelId: string | null;

  @ApiProperty()
  ownerId: string;

  @ApiProperty({ nullable: true })
  inviteCode: string | null;

  @ApiProperty({ format: 'date-time' })
  @Transform(({ value }) => value.toISOString())
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  @Transform(({ value }) => value.toISOString())
  updatedAt: Date;

  constructor(partial: Partial<FamilyResponseDto>) {
    Object.assign(this, partial);
  }
}
