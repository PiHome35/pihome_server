import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../user.dto';
import { Type } from 'class-transformer';

export class ListFamilyUsersResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  @Type(() => UserResponseDto)
  users: UserResponseDto[];

  constructor(partial: Partial<ListFamilyUsersResponseDto>) {
    Object.assign(this, partial);
  }
}
