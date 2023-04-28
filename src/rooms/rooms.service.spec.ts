import { Test, TestingModule } from '@nestjs/testing';
import { RoomsService } from './rooms.service';
import { AuthService } from '../auth/auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import Room from './entities/room.entity';
import User from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateRoomDto } from './dto/create-room.dto';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
});

const mockAuthService = () => ({});

describe('RoomsService', () => {
  let service: RoomsService;
  let authService: AuthService;
  let roomRepository: Repository<Room> & any;
  let userRepository: Repository<User> & any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        {
          provide: AuthService,
          useFactory: mockAuthService,
        },
        {
          provide: getRepositoryToken(Room),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
    authService = module.get<AuthService>(AuthService);
    roomRepository = module.get<Repository<Room>>(getRepositoryToken(Room));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new room and return it', async () => {
      const createRoomDto: CreateRoomDto = {
        name: 'test-room',
      };
      const userId = 1;

      const user: User = {
        id: userId,
        email: 'test@example.com',
        password: '12345678',
        rooms: [],
        messages: [],
      };
      const room: Room = {
        ...createRoomDto,
        messages: [],
        users: [user],
      };

      userRepository.findOne.mockResolvedValue(user);
      roomRepository.create.mockReturnValue(room);
      roomRepository.save.mockResolvedValue(room);

      const result = await service.create(createRoomDto, userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['rooms'],
      });
      expect(roomRepository.create).toHaveBeenCalledWith({
        ...createRoomDto,
        users: [user],
      });
      expect(roomRepository.save).toHaveBeenCalledWith(room);
      expect(result).toEqual(room);
    });
  });

  describe('addUserToRoom', () => {
    it('should add a user to a room and return the updated user', async () => {
      const userId = 1;
      const roomId = 2;
      const user: User = {
        id: userId,
        rooms: [],
        email: 'test@example.com',
        password: '12345678',
        messages: [],
      };
      const room: Room = {
        id: roomId,
        name: 'test-room',
        messages: [],
        users: [user],
      };

      userRepository.findOne.mockResolvedValue(user);
      roomRepository.findOne.mockResolvedValue(room);

      const updatedUser: User = {
        ...user,
        rooms: [room],
      };
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await service.addUserToRoom(userId, roomId);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['rooms'],
      });
      expect(roomRepository.findOne).toHaveBeenCalledWith({
        where: { id: roomId },
      });
      expect(userRepository.save).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual(updatedUser);
    });

    it('should throw a NotFoundException if user or room is not found', async () => {
      const userId = 1;
      const roomId = 2;

      userRepository.findOne.mockResolvedValue(null);
      roomRepository.findOne.mockResolvedValue(null);

      await expect(service.addUserToRoom(userId, roomId)).rejects.toThrowError(
        /User or Room not found/,
      );
    });
  });

  describe('removeUserFromRoom', () => {
    it('should remove a user from a room and return the updated user', async () => {
      const userId = 1;
      const roomId = 2;
      const room: Room = {
        id: roomId,
        name: 'test-room',
        messages: [],
        users: [],
      };
      const user: User = {
        id: userId,
        rooms: [room],
        email: 'test@example.com',
        password: '12345678',
        messages: [],
      };

      userRepository.findOne.mockResolvedValue(user);

      const updatedUser: User = {
        ...user,
        rooms: [],
      };
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await service.removeUserFromRoom(userId, roomId);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['rooms'],
      });
      expect(userRepository.save).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual(updatedUser);
    });

    it('should throw a NotFoundException if user is not found', async () => {
      const userId = 1;
      const roomId = 2;

      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeUserFromRoom(userId, roomId),
      ).rejects.toThrowError(/User not found/);
    });
  });

  describe('findAll', () => {
    it('should return all rooms', async () => {
      const rooms: Room[] = [
        {
          id: 1,
          name: 'test-room',
          messages: [],
          users: [],
        },
        {
          id: 2,
          name: 'test-room',
          messages: [],
          users: [],
        },
      ];

      roomRepository.find.mockResolvedValue(rooms);

      const result = await service.findAll();

      expect(roomRepository.find).toHaveBeenCalled();
      expect(result).toEqual(rooms);
    });
  });

  describe('findOne', () => {
    it('should find a room by id and return it', async () => {
      const roomId = 1;
      const room: Room = {
        id: roomId,
        name: 'test-room',
        messages: [],
        users: [],
      };

      roomRepository.findOne.mockResolvedValue(room);

      const result = await service.findOne(roomId);

      expect(roomRepository.findOne).toHaveBeenCalledWith({
        where: { id: roomId },
        relations: ['users', 'messages'],
      });
      expect(result).toEqual(room);
    });

    it('should return null if the room is not found', async () => {
      const roomId = 1;

      roomRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(roomId);

      expect(roomRepository.findOne).toHaveBeenCalledWith({
        where: { id: roomId },
        relations: ['users', 'messages'],
      });
      expect(result).toBeNull();
    });
  });
});
