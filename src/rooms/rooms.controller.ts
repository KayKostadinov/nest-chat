import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  Delete,
  Query,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import JwtAuthGuard from '../auth/jwtAuth.guard';
import { MessagesService } from '../messages/messages.service';
import Message from '../messages/entities/message.entity';

@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly messagesService: MessagesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createRoomDto: CreateRoomDto, @Req() { user }) {
    return this.roomsService.create(createRoomDto, user.id);
  }

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(Number(id));
  }

  @Post(':roomId/users/:userId')
  @UseGuards(JwtAuthGuard)
  async addUserToRoom(
    @Param('userId') userId: number,
    @Param('roomId') roomId: number,
  ) {
    return this.roomsService.addUserToRoom(userId, roomId);
  }

  @Delete(':roomId/users/:userId')
  @UseGuards(JwtAuthGuard)
  async removeUserFromRoom(
    @Param('userId') userId: number,
    @Param('roomId') roomId: number,
  ) {
    return this.roomsService.removeUserFromRoom(userId, roomId);
  }

  @Get(':roomId/messages')
  async getLatestMessages(
    @Param('roomId') roomId: number,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<Message[]> {
    page = page || 1;
    limit = limit || 10;

    return this.messagesService.getLatestMessages(roomId, page, limit);
  }
}
