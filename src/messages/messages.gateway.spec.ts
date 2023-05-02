import { Test } from '@nestjs/testing';
import { MessagingGateway } from './messages.gateway';
import { RoomsService } from '../rooms/rooms.service';
import { UsersService } from '../users/users.service';
import { MessagesService } from './messages.service';
import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { io } from 'socket.io-client';

describe('MessagingGateway', () => {
  let gateway: MessagingGateway;
  let app: INestApplication;
  let client;
  let httpServer;

  const roomsServiceMock = {
    addUserToRoom: jest.fn(),
    removeUserFromRoom: jest.fn(),
  };

  const usersServiceMock = {};

  const messagesServiceMock = {
    createMessage: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MessagingGateway,
        { provide: RoomsService, useValue: roomsServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: MessagesService, useValue: messagesServiceMock },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useWebSocketAdapter(new IoAdapter(app));
    await app.init();
    httpServer = await app.listen(0);
    const wsUrl = `http://localhost:${httpServer.address().port}/chat`;
    client = io(wsUrl, { autoConnect: false });
    client.connect();
    gateway = moduleRef.get<MessagingGateway>(MessagingGateway);
  });

  afterAll(async () => {
    client.disconnect();
    await app.close();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should join a room', (done) => {
    const roomId = 1;
    const userId = 1;
    client.on('userJoined', (data) => {
      expect(data).toEqual({ userId, roomId });
      done();
    });
    client.emit('joinRoom', { roomId, userId });
  });

  it('should send a message', async () => {
    const roomId = 1;
    const userId = 1;
    const content = 'test';
    const messageId = 1;
    const timestamp = new Date();

    messagesServiceMock.createMessage.mockResolvedValue({
      id: messageId,
      updatedAt: timestamp,
    });

    const messageReceived = new Promise((resolve) => {
      client.on('messageReceived', (data) => {
        expect(data).toEqual({
          userId,
          roomId,
          content,
          messageId,
          timestamp: timestamp.toISOString(),
        });
        resolve(null);
      });
    });

    client.emit('sendMessage', { roomId, userId, content });

    await messageReceived;
  });

  it('should leave a room', async () => {
    const roomId = 1;
    const userId = 1;

    const userLeft = new Promise((resolve) => {
      client.on('userLeft', (data) => {
        expect(data).toEqual({ userId, roomId });
        resolve(null);
      });
    });

    client.emit('leaveRoom', { roomId, userId });

    await userLeft;
  });
});
