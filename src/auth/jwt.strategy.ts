import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          const token = request.headers.authentication;
          return token;
        },
      ]),
      ignoreExpiration: true, // for testing purposes, should be false in production
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    Logger.log('jwt strategy', { payload });
    const user = await this.userService.findOneById(payload.userId);
    if (!user) {
      throw new UnauthorizedException('You are not authorized');
    }
    return payload;
  }
}
