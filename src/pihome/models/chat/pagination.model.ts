import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

@InputType()
export class PaginationDto {
  @Field(() => Int, { defaultValue: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit: number = 20;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  skip: number = 0;
}
