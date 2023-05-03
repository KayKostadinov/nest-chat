import {
  Controller,
  Body,
  Post,
  Get,
  UseGuards,
  Request,
  HttpCode,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/user.dto';
import { LocalAuthGuard } from './localAuth.guard';
import { Response } from 'express';
import { sanitizeUser } from './sanitizeUser';
import JwtAuthGuard from './jwtAuth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() { user }, @Res({ passthrough: true }) res: Response) {
    const cookie = this.authService.getCookieWithJwtToken(user.id);
    res.setHeader('Set-Cookie', cookie);
    return res.send(sanitizeUser(user));
  }

  @Post('signup')
  async signUp(@Body() user: CreateUserDto) {
    return await this.authService.register(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logOut(@Request() req, @Res() res: Response) {
    res.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
    return res.sendStatus(200);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  authenticate(@Request() { user }) {
    return sanitizeUser(user);
  }
}
