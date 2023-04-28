import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from '../rooms/rooms.service';
import { UsersService } from '../users/users.service';
import { MessagesService } from './messages.service';

@WebSocketGateway({ namespace: '/chat' })
export class MessagingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly roomsService: RoomsService,
    private readonly usersService: UsersService,
    private readonly messagesService: MessagesService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, { roomId, userId }): Promise<void> {
    await this.roomsService.addUserToRoom(userId, roomId);
    client.join(roomId.toString());
    client.to(roomId.toString()).emit('userJoined', { userId, roomId });
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(client: Socket, { roomId, userId }): Promise<void> {
    await this.roomsService.removeUserFromRoom(userId, roomId);
    client.leave(roomId.toString());
    client.to(roomId.toString()).emit('userLeft', { userId, roomId });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    { roomId, userId, content },
  ): Promise<void> {
    const message = await this.messagesService.createMessage(
      content,
      userId,
      roomId,
    );

    client.to(roomId.toString()).emit('messageReceived', {
      userId,
      roomId,
      content,
      messageId: message.id,
      timestamp: message.updatedAt,
    });
  }
}
