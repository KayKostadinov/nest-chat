import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { MessagesService } from '../messages/messages.service';
import { AuthService } from '../auth/auth.service';
import JwtAuthGuard from '../auth/jwtAuth.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import Room from './entities/room.entity';
import User from '../users/entities/user.entity';

jest.mock('../auth/jwtAuth.guard');

describe('RoomsController', () => {
  let controller: RoomsController;
  let roomsService: RoomsService;
  let messagesService: MessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [
        {
          provide: RoomsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            addUserToRoom: jest.fn(),
            removeUserFromRoom: jest.fn(),
          },
        },
        {
          provide: MessagesService,
          useValue: {
            getLatestMessages: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {},
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockResolvedValue(true) })
      .compile();

    controller = module.get<RoomsController>(RoomsController);
    roomsService = module.get<RoomsService>(RoomsService);
    messagesService = module.get<MessagesService>(MessagesService);
  });

  it('should create a room', async () => {
    const createRoomDto: CreateRoomDto = {
      name: 'Test Room',
    };
    const user: User = {
      id: 1,
      email: 'test@example.com',
      password: 'test',
      rooms: [],
      messages: [],
    };
    const createdRoom: Room = {
      id: 1,
      name: 'Test Room',
      users: [user],
      messages: [],
    };

    jest.spyOn(roomsService, 'create').mockResolvedValue(createdRoom);

    expect(await controller.create(createRoomDto, { user })).toBe(createdRoom);
    expect(roomsService.create).toHaveBeenCalledWith(createRoomDto, user.id);
  });

  it('should find all rooms', async () => {
    const rooms = [
      { id: 1, name: 'Room 1' },
      { id: 2, name: 'Room 2' },
    ] as Room[];

    jest.spyOn(roomsService, 'findAll').mockResolvedValue(rooms);

    expect(await controller.findAll()).toBe(rooms);
    expect(roomsService.findAll).toHaveBeenCalled();
  });

  it('should find one room by id', async () => {
    const roomId = 1;
    const room = {
      id: roomId,
      name: 'Room 1',
      users: [],
      messages: [],
    };

    jest.spyOn(roomsService, 'findOne').mockResolvedValue(room);

    expect(await controller.findOne(roomId.toString())).toBe(room);
    expect(roomsService.findOne).toHaveBeenCalledWith(roomId);
  });

  it('should add a user to a room', async () => {
    const userId = 1;
    const roomId = 1;
    const user = { id: userId, rooms: [] } as User;

    jest.spyOn(roomsService, 'addUserToRoom').mockResolvedValue(user);

    expect(await controller.addUserToRoom(userId, roomId)).toBe(user);
    expect(roomsService.addUserToRoom).toHaveBeenCalledWith(userId, roomId);
  });

  it('should remove a user from a room', async () => {
    const userId = 1;
    const roomId = 1;
    const user = { id: userId, rooms: [] } as User;

    jest.spyOn(roomsService, 'removeUserFromRoom').mockResolvedValue(user);

    expect(await controller.removeUserFromRoom(userId, roomId)).toBe(user);
    expect(roomsService.removeUserFromRoom).toHaveBeenCalledWith(
      userId,
      roomId,
    );
  });

  it('should get the latest messages in a room with default page and limit', async () => {
    const room = { id: 1, name: 'Room 1', users: [], messages: [] } as Room;
    const user = { id: 1, email: 'test@example.com', password: 'test' } as User;
    const defaultPage = 1;
    const defaultLimit = 10;
    const messages = [
      { id: 1, content: 'Message 1', room, user },
      { id: 2, content: 'Message 2', room, user },
    ];

    jest
      .spyOn(messagesService, 'getLatestMessages')
      .mockResolvedValue(messages);

    expect(await controller.getLatestMessages(room.id)).toBe(messages);
    expect(messagesService.getLatestMessages).toHaveBeenCalledWith(
      room.id,
      defaultPage,
      defaultLimit,
    );
  });

  it('should get the latest messages in a room with custom page and limit', async () => {
    const room = { id: 1, name: 'Room 1', users: [], messages: [] } as Room;
    const user = { id: 1, email: 'test@example.com', password: 'test' } as User;
    const customPage = 2;
    const customLimit = 5;
    const messages = [
      { id: 1, content: 'Message 1', room, user },
      { id: 2, content: 'Message 2', room, user },
    ];

    jest
      .spyOn(messagesService, 'getLatestMessages')
      .mockResolvedValue(messages);

    expect(
      await controller.getLatestMessages(room.id, customPage, customLimit),
    ).toBe(messages);
    expect(messagesService.getLatestMessages).toHaveBeenCalledWith(
      room.id,
      customPage,
      customLimit,
    );
  });
});
