import { ApiProperty } from '@nestjs/swagger';

export class AgentResponseDto {
  @ApiProperty({
    description: "The agent's response to the query",
    example: "I've calculated that 5 plus 3 equals 8",
  })
  response: string;
}
