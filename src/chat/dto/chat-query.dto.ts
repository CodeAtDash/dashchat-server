import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  offset?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;
}
