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

@WebSocketGateway()
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

    const message = await this.chatService.createMessage({
      senderId: user.id,
      receiverId: body.receiverId,
      content: body.content,
    });

    const receiverDetails = await this.userService.findOne({
      id: message.receiverId,
    });

    const response = {
      ...message.dataValues,
      receiverUserDetails: receiverDetails,
    };

    const receiverClientId = await this.redisService.getObject(body.receiverId);

    if (isPresent(receiverClientId)) {
      this.server.to(receiverClientId).emit('message', response);
    }

    return response;
  }

  async getUser(accessToken: string) {
    const { id, username } = await getUserFromAuthToken(
      { accessToken },
      this.jwtService,
    );
    return this.userService.findOne({ id, username });
  }
}
