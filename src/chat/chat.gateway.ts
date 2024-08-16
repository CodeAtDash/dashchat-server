import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessageDto } from './dto/message.dto';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { RedisService } from 'src/common/services/redis.services';
import { getUserFromAuthToken, isPresent } from 'src/utils/helpers';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/services/users.service';
import { GroupMessageDto } from './dto/group-message.dto';
import { GroupChatService } from './group-chat.service';
import { GroupMemberService } from './group-member.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer() server: any;

  constructor(
    private readonly chatService: ChatService,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly groupMemberService: GroupMemberService,
    private readonly groupChatService: GroupChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const user = await this.getUser(
        client.handshake.headers.access_token as string,
      );

      if (!user) {
        client.disconnect();
        return;
      }

      await this.redisService.setObject(user.id, client.id);
    } catch (error) {
      console.error('Error in handleConnection:', error);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const user = await this.getUser(
        client.handshake.headers.access_token as string,
      );

      if (user) {
        await this.redisService.setObject(user.id, new Date());
      }
    } catch (error) {
      console.error('Error in handleDisconnect:', error);
    }
  }

  @SubscribeMessage('message')
  async handleChatUpdate(client: Socket, body: MessageDto) {
    const user = await this.getUser(
      client.handshake.headers.access_token as string,
    );

    if (!user) {
      client.disconnect();
      return;
    }

    const message = await this.chatService.create({
      senderId: user.id,
      receiverId: body.receiverId,
      content: body.content,
    });

    const senderDetails = await this.userService.findOne({
      id: message.senderId,
    });

    const response = {
      ...message.dataValues,
      senderUserDetails: senderDetails,
    };

    const receiverClientId = await this.redisService.getObject(body.receiverId);

    if (isPresent(receiverClientId) && isNaN(Date.parse(receiverClientId))) {
      this.server.to(receiverClientId).emit('message', response);
    }
  }

  @SubscribeMessage('group-message')
  async handleGroupMessage(client: Socket, body: GroupMessageDto) {
    const user = await this.getUser(
      client.handshake.headers.access_token as string,
    );

    if (!user) {
      client.disconnect();
      return;
    }

    const isUserGroupMember = await this.groupMemberService.findOne({
      groupId: body.groupId,
      userId: user.id,
    });

    if (!isUserGroupMember) {
      return;
    }

    const groupMessage = await this.groupChatService.create({
      groupId: body.groupId,
      senderId: user.id,
      content: body.content,
    });

    const groupMembers = await this.groupMemberService.findAll({
      groupId: body.groupId,
    });

    const senderDetails = user;

    const response = {
      ...groupMessage.dataValues,
      senderUserDetails: senderDetails,
    };

    for (const member of groupMembers) {
      const memberClientId = await this.redisService.getObject(member.userId);

      if (isPresent(memberClientId) && isNaN(Date.parse(memberClientId))) {
        this.server.to(memberClientId).emit('group-message', response);
      }
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(client: Socket, body: { receiverId: string }) {
    const user = await this.getUser(
      client.handshake.headers.access_token as string,
    );

    if (!user) {
      client.disconnect();
      return;
    }

    const receiverClientId = await this.redisService.getObject(body.receiverId);

    if (isPresent(receiverClientId) && isNaN(Date.parse(receiverClientId))) {
      this.server.to(receiverClientId).emit('typing', { senderId: user.id });
    }
  }

  @SubscribeMessage('group-typing')
  async handleGroupTyping(client: Socket, body: { groupId: string }) {
    const user = await this.getUser(
      client.handshake.headers.access_token as string,
    );

    if (!user) {
      client.disconnect();
      return;
    }

    const groupMembers = await this.groupMemberService.findAll({
      groupId: body.groupId,
    });

    for (const member of groupMembers) {
      const memberClientId = await this.redisService.getObject(member.userId);

      if (isPresent(memberClientId) && isNaN(Date.parse(memberClientId))) {
        this.server
          .to(memberClientId)
          .emit('group-typing', { senderId: user.id });
      }
    }
  }

  async getUser(accessToken: string) {
    try {
      const { id } = await getUserFromAuthToken(
        { accessToken },
        this.jwtService,
      );

      return this.userService.findOne({ id });
    } catch (error) {
      console.log(error);
    }
  }
}
