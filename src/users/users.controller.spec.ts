import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/user.dto';

jest.mock('./users.service');

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call UsersService.create with the given CreateUserDto and return the result', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: '12345678',
      };

      const expectedResult = { ...createUserDto, id: expect.any(Number) };

      service.create = jest.fn().mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should call UsersService.findOneById with the given id and return the result', async () => {
      const id = '1';
      const expectedResult = {
        /* ...set your expected result here... */
      };

      service.findOneById = jest.fn().mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(service.findOneById).toHaveBeenCalledWith(Number(id));
      expect(result).toEqual(expectedResult);
    });
  });
});
