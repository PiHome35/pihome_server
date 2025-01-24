import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AgentQueryDto {
  @ApiProperty({
    description: 'The message to be processed by the agent',
    example: 'Calculate 5 plus 3',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
