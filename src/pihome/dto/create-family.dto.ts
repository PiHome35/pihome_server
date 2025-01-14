import { ApiProperty } from '@nestjs/swagger';

export class CreateFamilyRequestDto {
  @ApiProperty()
  name: string;
}

export class CreateFamilyResponseDto {
  @ApiProperty()
  id: string;
}
