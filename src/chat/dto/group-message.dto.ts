import { IsString, IsUUID } from 'class-validator';

export class GroupMessageDto {
  @IsUUID()
  groupId: string;

  @IsString()
  content: string;
}
