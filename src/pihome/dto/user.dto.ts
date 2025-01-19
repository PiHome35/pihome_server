import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @Exclude()
  passwordHash: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  familyId: string | null;

  @ApiProperty({ format: 'date-time' })
  @Transform(({ value }) => value.toISOString())
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  @Transform(({ value }) => value.toISOString())
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
