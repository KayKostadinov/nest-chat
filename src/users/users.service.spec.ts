import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/user.dto';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});

const createUserDto: CreateUserDto = {
  email: 'test@example.com',
  password: '12345678',
};

const createdUser: User = {
  ...createUserDto,
  id: expect.any(Number),
  rooms: [],
  messages: [],
};

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<User> & any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user and return it', async () => {
      usersRepository.create.mockResolvedValue(createdUser);
      usersRepository.save.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(usersRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(usersRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });

    it('should throw a BadRequestException if user creation fails', async () => {
      usersRepository.create.mockRejectedValue(new Error());

      await expect(service.create(createUserDto)).rejects.toThrowError(
        /User already exists/,
      );
    });
  });

  describe('findOneById', () => {
    it('should find a user by id and return it', async () => {
      const id = 1;

      usersRepository.findOne.mockResolvedValue(createdUser);

      const result = await service.findOneById(id);

      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(createdUser);
    });

    it('should throw a NotFoundException if user is not found', async () => {
      const id = 1;

      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneById(id)).rejects.toThrowError(
        /User not found/,
      );
    });
  });

  describe('findOneByEmail', () => {
    it('should find a user by email and return it', async () => {
      const email = 'test@example.com';

      usersRepository.findOne.mockResolvedValue(createdUser);

      const result = await service.findOneByEmail(email);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(createdUser);
    });

    it('should throw a NotFoundException if user is not found', async () => {
      const email = 'test@example.com';

      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneByEmail(email)).rejects.toThrowError(
        /User not found/,
      );
    });
  });
});
