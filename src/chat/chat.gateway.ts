import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
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
      client.handshake.headers.access_token as string,
    );

    if (!user) {
      client.disconnect();
      return;
    }

    await this.redisService.setObject(user.id, 'online');
  }

  async handleDisconnect(client: Socket) {
    const user = await this.getUser(
      client.handshake.headers.access_token as string,
    );

    if (!user) {
      client.disconnect();
      return;
    }

    await this.redisService.setObject(user.id, new Date());
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
    
    const response = await this.chatService.createMessage(
      user.id,
      body.receiverId,
      body.content,
    );
    
    // client.emit(client.id, body.content);
    await this.server.emit(body.receiverId, {response, senderId: user.id});

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
