import { ApiProperty } from '@nestjs/swagger';

export class GetUserResponseDto {
  @ApiProperty({ description: 'User id', example: 'as213123123' })
  id: string;

  @ApiProperty({ description: 'User name', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'User email', example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ description: 'User family id', example: 'as213123123' })
  familyId?: string;

  @ApiProperty({ description: 'User family name', example: 'Doe Family' })
  familyName?: string;
}
