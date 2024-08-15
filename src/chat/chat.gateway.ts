import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessageDto } from './dto/message.dto';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { RedisService } from 'src/common/services/redis.services';
import {
  getUserFromAuthToken,
  isNilOrEmpty,
  isPresent,
} from 'src/utils/helpers';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/services/users.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer() server: any;

  constructor(
    private readonly chatService: ChatService,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    const user = await this.getUser(
      client.handshake.headers.access_token as string,
    );

    if (isNilOrEmpty(user)) {
      client.disconnect();
      return;
    }

    await this.redisService.setObject(user!.id, client.id);
  }

  async handleDisconnect(client: Socket) {
    const user = await this.getUser(
      client.handshake.headers.access_token as string,
    );

    await this.redisService.setObject(user!.id, new Date());
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

    return response;
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

  async getUser(accessToken: string) {
    const { id } = await getUserFromAuthToken({ accessToken }, this.jwtService);

    return this.userService.findOne({ id });
  }
}
