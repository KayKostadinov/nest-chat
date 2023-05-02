import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Room from './entities/room.entity';
import User from '../users/entities/user.entity';
import Message from '../messages/entities/message.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { AuthService } from '../auth/auth.service';
import { MessagesService } from '../messages/messages.service';
import { UsersService } from '../users/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, User, Message]),
    AuthModule,
    UsersModule,
    MessagesModule,
  ],
  controllers: [RoomsController],
  providers: [RoomsService, AuthService, MessagesService, UsersService],
  exports: [RoomsService],
})
export class RoomsModule {}
