import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../user.dto';
import { Type } from 'class-transformer/types/decorators';

export class ListFamilyUsersResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  @Type(() => UserResponseDto)
  users: UserResponseDto[];
}
