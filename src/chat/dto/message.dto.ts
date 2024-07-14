import { IsString, IsUUID } from "class-validator";

export class MessageDto {
  @IsUUID()
  receiverId: string;

  @IsString()
  content: string;
}
