import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/user.dto';
import { ExecutionContext } from '@nestjs/common';
import { Response } from 'express';
import JwtAuthGuard from './jwtAuth.guard';
import { LocalAuthGuard } from './localAuth.guard';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            validateUser: jest.fn(),
            getCookieWithJwtToken: jest.fn(),
            getCookieForLogOut: jest.fn(),
          },
        },
        {
          provide: LocalAuthGuard,
          useClass: class extends LocalAuthGuard {
            canActivate(context: ExecutionContext) {
              const req = context.switchToHttp().getRequest();
              req.user = { id: 1, email: 'test@example.com' };
              return true;
            }
          },
        },
        {
          provide: JwtAuthGuard,
          useClass: class extends JwtAuthGuard {
            canActivate(context: ExecutionContext) {
              const req = context.switchToHttp().getRequest();
              req.user = { id: 1, email: 'test@example.com' };
              return true;
            }
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should log in a user', async () => {
      const userId = 1;
      const cookie = 'Authentication=jwt_token; HttpOnly; Path=/; Max-Age=3600';
      const user = { id: userId, email: 'test@example.com' };

      authService.getCookieWithJwtToken = jest.fn().mockReturnValue(cookie);
      authService.validateUser = jest.fn().mockResolvedValue(user);

      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await authController.login({ user }, res);

      expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', cookie);
      expect(res.send).toHaveBeenCalledWith(user);
    });
  });

  describe('signUp', () => {
    it('should sign up a user', async () => {
      const userDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const sanitizedUser = {
        id: 1,
        email: 'test@example.com',
      };

      authService.register = jest.fn().mockResolvedValue(sanitizedUser);

      const result = await authController.signUp(userDto);

      expect(authService.register).toHaveBeenCalledWith(userDto);
      expect(result).toEqual(sanitizedUser);
    });
  });

  describe('logOut', () => {
    it('should log out a user', async () => {
      const logOutCookie = 'Authentication=; HttpOnly; Path=/; Max-Age=0';

      authService.getCookieForLogOut = jest.fn().mockReturnValue(logOutCookie);

      const req = { user: { id: 1, email: 'test@example.com' } };
      const res = {
        setHeader: jest.fn(),
        sendStatus: jest.fn(),
      } as unknown as Response;

      await authController.logOut(req, res);

      expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', logOutCookie);
      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });
  });

  describe('authenticate', () => {
    it('should return authenticated user', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
      };

      const req = { user };

      const result = authController.authenticate(req);

      expect(result).toEqual(user);
    });
  });
});
