import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { AuthModule } from '../auth/auth.module';
import { RoomsService } from '../rooms/rooms.service';
import { UsersService } from '../users/users.service';
import { MessagingGateway } from './messages.gateway';
import User from '../users/entities/user.entity';
import Room from '../rooms/entities/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, User, Room]), AuthModule],
  providers: [MessagingGateway, MessagesService, RoomsService, UsersService],
  exports: [MessagesService],
})
export class MessagesModule {}
