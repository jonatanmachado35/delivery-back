import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { User } from '@prisma/client';

@WebSocketGateway(2000, {
  namespace: 'gps',
  transports: ['websocket'],
  pingTimeout: 10000,
  cors: {
    origin: '*',
  },
})
export class GpsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;
  private connectedSockets = new Map<string, Socket>();
  private logger = new Logger(GpsGateway.name);

  constructor(
    private prismaService: PrismaService,
    private jwt: JwtService,
  ) {}

  getClient(socketId: string): Socket | undefined {
    return this.connectedSockets.get(socketId);
  }

  afterInit(server: Server) {
    this.server = server;
    server.use((socket, next): void => {
      const token = (socket.handshake.auth['token'] as string)?.split(' ')?.[1];

      if (!token) {
        next(new Error('Authentication error'));
        return;
      }

      this.authorize(token)
        .then((isAuthorized) => {
          if (!isAuthorized) {
            return next(new Error('Unauthorized'));
          }
          (socket as { data: User }).data = isAuthorized;
          next();
        })
        .catch((error) => {
          this.logger.error('Authorization error:', error);
          next(new Error('Authentication error'));
        });
    });
  }

  emitRoom(
    roomCode: string,
    event: string,
    data: { latitude: number; longitude: number },
  ) {
    this.server.to(roomCode).emit(event, data);
  }

  disconnectClient(clientId: string) {
    const client = this.connectedSockets.get(clientId);
    if (client) {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, roomCode: string) {
    await this.leaveAllRooms(client);

    await client.join(roomCode);
    this.logger.log(`Client ${client.id} joined room ${roomCode}`);

    // Envia confirmação apenas para este cliente
    client.emit('roomMessage', `Você entrou na room ${roomCode}`);

    // Envia mensagem para todos na room (exceto o próprio cliente)
    client
      .to(roomCode)
      .emit('roomMessage', `Novo usuário entrou na room ${roomCode}`);

    return { event: 'roomJoined', data: roomCode };
  }

  private async leaveAllRooms(client: Socket) {
    const rooms = Array.from(client.rooms);

    await Promise.allSettled(
      rooms.map((room) => {
        if (room !== client.id) {
          return client.leave(room);
        }
      }),
    );
  }

  handleDisconnect(client: { id: string }) {
    this.logger.log('Client disconnected', client.id);

    delete this.connectedSockets[client.id];
  }

  async authorize(token: string): Promise<User | null> {
    try {
      const { id } = this.jwt.verify<{ id: number }>(token);

      const user = (await this.prismaService.user.findUnique({
        where: { id },
        select: { id: true, status: true },
      })) as User;

      if (user && user.status !== 'ACTIVE') {
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error('Token verification failed:', error);
      return null;
    }
  }

  handleConnection(client: { id: string; data: User }) {
    this.logger.log('Client connected', client.id);

    this.connectedSockets.set(client.id, client as Socket);
  }

  @SubscribeMessage('message')
  handleMessage(): string {
    return 'Hello world!';
  }
}
