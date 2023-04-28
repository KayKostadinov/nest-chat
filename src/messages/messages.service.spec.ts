import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import User from '../users/entities/user.entity';
import Room from '../rooms/entities/room.entity';
import { Repository } from 'typeorm';

const mockRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
};

describe('MessagesService', () => {
  let service: MessagesService & any;
  let messageRepository: Repository<Message> & any;
  let userRepository: Repository<User> & any;
  let roomRepository: Repository<Room> & any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: getRepositoryToken(Message),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Room),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    messageRepository = module.get<Repository<Message>>(
      getRepositoryToken(Message),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    roomRepository = module.get<Repository<Room>>(getRepositoryToken(Room));

    messageRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
  });

  // it('should be defined', () => {
  //   expect(service).toBeDefined();
  // });

  describe('createMessage', () => {
    it('should create a new message successfully', async () => {
      const content = 'Test message';
      const userId = 1;
      const roomId = 2;
      const user = new User();
      const room = new Room();

      userRepository.findOne.mockResolvedValue(user);
      roomRepository.findOne.mockResolvedValue(room);
      messageRepository.create.mockReturnValue(new Message());
      messageRepository.save.mockResolvedValue(new Message());

      const createdMessage = await service.createMessage(
        content,
        userId,
        roomId,
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(roomRepository.findOne).toHaveBeenCalledWith({
        where: { id: roomId },
      });
      expect(messageRepository.create).toHaveBeenCalled();
      expect(messageRepository.save).toHaveBeenCalled();
      expect(createdMessage).toBeInstanceOf(Message);
    });

    it('should throw an error if user or room is not found', async () => {
      const content = 'Test message';
      const userId = 1;
      const roomId = 2;

      userRepository.findOne.mockResolvedValue(null);
      roomRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createMessage(content, userId, roomId),
      ).rejects.toThrow('User or Room not found');
    });
  });

  describe('getLatestMessages', () => {
    it('should get latest messages successfully', async () => {
      const roomId = 1;
      const page = 1;
      const limit = 10;
      const room = new Room();
      const messages = [new Message(), new Message()];

      roomRepository.findOne.mockResolvedValue(room);
      mockQueryBuilder.getMany.mockResolvedValue(messages);

      const latestMessages = await service.getLatestMessages(
        roomId,
        page,
        limit,
      );

      expect(roomRepository.findOne).toHaveBeenCalledWith({
        where: { id: roomId },
      });
      expect(messageRepository.createQueryBuilder).toHaveBeenCalledWith(
        'message',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'message.roomId = :roomId',
        { roomId },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'message.timestamp',
        'DESC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith((page - 1) * limit);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(limit);
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(latestMessages).toEqual(messages);
    });

    it('should throw an error if the room is not found', async () => {
      const roomId = 1;
      const page = 1;
      const limit = 10;

      roomRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getLatestMessages(roomId, page, limit),
      ).rejects.toThrow('Room not found');
    });
  });
});
