import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import CreateUserDto from '../users/dto/user.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findOneByEmail: jest.fn(),
            findOneById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registrationData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const createdUser = {
        id: 1,
        ...registrationData,
      };

      usersService.create = jest.fn().mockResolvedValue(createdUser);

      const result = await authService.register(registrationData);
      expect(result).toEqual({ id: createdUser.id, email: createdUser.email });
    });

    it('should throw an error if a user with the same email already exists', async () => {
      const registrationData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      usersService.create = jest.fn().mockRejectedValue({ code: '23505' });

      await expect(authService.register(registrationData)).rejects.toThrow(
        new HttpException(
          'User with that email already exists',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an error if something goes wrong on the database level', async () => {
      const registrationData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      usersService.create = jest.fn().mockRejectedValue({ code: '123123' });

      await expect(authService.register(registrationData)).rejects.toThrow(
        new HttpException(
          'Something went wrong',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('validateUser', () => {
    it('should return a sanitized user when the provided credentials are valid', async () => {
      const email = 'test@example.com';
      const hashedPassword = 'hashed_password123';
      const user = {
        id: 1,
        email,
        password: hashedPassword,
      };

      usersService.findOneByEmail = jest.fn().mockResolvedValue(user);

      const result = await authService.validateUser(email, hashedPassword);
      expect(result).toEqual({ id: user.id, email: user.email });
    });

    it('should throw an error when the provided password is incorrect', async () => {
      const email = 'test@example.com';
      const hashedPassword = 'hashed_password123';
      const incorrectPassword = 'incorrect_password123';
      const user = {
        id: 1,
        email,
        password: hashedPassword,
      };

      usersService.findOneByEmail = jest.fn().mockResolvedValue(user);

      await expect(
        authService.validateUser(email, incorrectPassword),
      ).rejects.toThrow(
        new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('getCookieWithJwtToken', () => {
    it('should return a cookie with a JWT token', () => {
      const userId = 1;
      const token = 'jwt_token';
      const jwtTtl = '3600';

      jwtService.sign = jest.fn().mockReturnValue(token);
      configService.get = jest.fn().mockReturnValue(jwtTtl);

      const result = authService.getCookieWithJwtToken(userId);

      expect(result).toEqual(
        `Authentication=${token}; HttpOnly; Path=/; Max-Age=${jwtTtl}`,
      );
    });

    it('should throw an error when the JWT token cannot be created', () => {
      jwtService.sign = jest.fn().mockImplementation(() => {
        throw new Error('Cannot create JWT token');
      });

      expect(() => authService.getCookieWithJwtToken(1)).toThrow(
        new HttpException(
          'Something went wrong',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('getCookieForLogOut', () => {
    it('should return a cookie to log the user out', () => {
      const result = authService.getCookieForLogOut();

      expect(result).toEqual('Authentication=; HttpOnly; Path=/; Max-Age=0');
    });
  });

  describe('getUserFromToken', () => {
    it('should return a user associated with a valid token', async () => {
      const userId = 1;
      const token = 'jwt_token';
      const jwtSecret = 'jwt_secret';
      const user = {
        id: userId,
        email: 'test@example.com',
        password: 'hashed_password123',
      };

      jwtService.verify = jest.fn().mockReturnValue({ userId });
      configService.get = jest.fn().mockReturnValue(jwtSecret);
      usersService.findOneById = jest.fn().mockResolvedValue(user);

      const result = await authService.getUserFromToken(token);

      expect(result).toEqual(user);
    });

    it('should return undefined when the token is invalid', async () => {
      const token = 'invalid_jwt_token';
      const jwtSecret = 'jwt_secret';

      jwtService.verify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });
      configService.get = jest.fn().mockReturnValue(jwtSecret);

      const result = await authService.getUserFromToken(token);

      expect(result).toBeUndefined();
    });
  });
});
