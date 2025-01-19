import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  familyId: string | null;

  @ApiProperty({ format: 'date-time' })
  @Transform(({ value }) => value.toISOString())
  createdAt: Date;

  @ApiProperty({ format: 'date-time', nullable: true })
  @Transform(({ value }) => (value ? value.toISOString() : null))
  updatedAt: Date | null;
}
