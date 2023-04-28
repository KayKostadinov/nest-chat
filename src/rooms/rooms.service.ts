import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { AuthService } from '../auth/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import Room from './entities/room.entity';
import { Repository } from 'typeorm';
import User from '../users/entities/user.entity';

@Injectable()
export class RoomsService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createRoomDto: CreateRoomDto, userId: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['rooms'],
      });
      const room = await this.roomRepository.create({
        ...createRoomDto,
        users: [user],
      });
      return this.roomRepository.save(room);
    } catch (error) {
      Logger.log(error);
    }
  }

  async addUserToRoom(userId: number, roomId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['rooms'],
    });
    const room = await this.roomRepository.findOne({ where: { id: roomId } });

    if (!user || !room) {
      throw new NotFoundException('User or Room not found');
    }

    user.rooms.push(room);
    return this.userRepository.save(user);
  }

  async removeUserFromRoom(userId: number, roomId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['rooms'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.rooms = user.rooms.filter((room) => room.id !== roomId);
    return this.userRepository.save(user);
  }

  findAll() {
    return this.roomRepository.find();
  }

  findOne(id: number) {
    return this.roomRepository.findOne({
      where: { id },
      relations: ['users', 'messages'],
    });
  }
}
