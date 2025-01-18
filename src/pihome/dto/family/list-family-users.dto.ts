import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../user.dto';

export class ListFamilyUsersResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  users: UserResponseDto[];
}
