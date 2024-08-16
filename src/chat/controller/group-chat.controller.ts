import { Controller } from '@nestjs/common';
import { GroupChatService } from '../services/group-chat.service';

@Controller('group-chat')
export class GroupChatsController {
  constructor(private readonly groupChatService: GroupChatService) {}
}
