import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessageDto } from './dto/message.dto';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { RedisService } from 'src/common/services/redis.services';
import { getUserFromAuthToken } from 'src/utils/helpers';
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
      client.handshake.headers.accesstoken as string,
    );

    if (!user) {
      client.disconnect();
      return;
    }

    await this.redisService.setObject(user.id, 'online');
  }

  async handleDisconnect(client: Socket) {
    const user = await this.getUser(
      client.handshake.headers.accesstoken as string,
    );

    if (!user) {
      client.disconnect();
      return;
    }

    await this.redisService.setObject(user.id, new Date());
  }

  @SubscribeMessage('message')
  async handleChatUpdate(client: Socket, @MessageBody() body: MessageDto) {
    console.log(body.receiverId, body.content);
    console.log(client);
    const user = await this.getUser(
      client.handshake.headers.accesstoken as string,
    );

    if (!user) {
      client.disconnect();
      return;
    }
    await this.chatService.createMessage(
      body.senderId = user.id,
      body.receiverId,
      body.content,
    );
  }

  async getUser(accessToken: string) {
    const { id, username } = await getUserFromAuthToken(
      { accessToken },
      this.jwtService,
    );
    return this.userService.findOne({ id, username });
  }
}
