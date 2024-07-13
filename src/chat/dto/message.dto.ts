import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class MessageDto {
  senderId: string;
  receiverId: string;
  content: string;
}

export class FindMessagesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  offset?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10;
}
