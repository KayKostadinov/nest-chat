import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SanitizedUser, sanitizeUser } from './sanitizeUser';
import { JwtService } from '@nestjs/jwt';
import CreateUserDto from '../users/dto/user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async register(
    registrationData: CreateUserDto,
  ): Promise<SanitizedUser> {
    try {
      const createdUser = await this.usersService.create(registrationData);
      return sanitizeUser(createdUser);
    } catch (error) {
      if (error?.code === '23505') {
        throw new HttpException(
          'User with that email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async validateUser(email: string, hashedPassword: string) {
    try {
      const user = await this.usersService.findOneByEmail(email);
      const isPasswordMatching = hashedPassword === user.password;

      if (!isPasswordMatching) {
        throw new HttpException(
          'Wrong credentials provided',
          HttpStatus.BAD_REQUEST,
        );
      }
      return sanitizeUser(user);
    } catch (error) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public getCookieWithJwtToken(userId: number) {
    try {
      const token = this.jwtService.sign({ userId });
      return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
        'JWT_TTL',
      )}`;
    } catch (error) {
      Logger.error(error);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // istanbul ignore next
  public getCookieForLogOut() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }

  public async getUserFromToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      if (payload.userId) {
        return this.usersService.findOneById(payload.userId);
      }
    } catch (error) {
      return undefined;
    }
  }
}
