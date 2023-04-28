import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import Room from '../rooms/entities/room.entity';
import User from '../users/entities/user.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async createMessage(
    content: string,
    userId: number,
    roomId: number,
  ): Promise<Message> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const room = await this.roomRepository.findOne({ where: { id: roomId } });

    if (!user || !room) {
      throw new Error('User or Room not found');
    }

    const message = this.messageRepository.create({
      content,
      user,
      room,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.messageRepository.save(message);
  }

  async getLatestMessages(
    roomId: number,
    page: number,
    limit: number,
  ): Promise<Message[]> {
    const room = await this.roomRepository.findOne({ where: { id: roomId } });

    if (!room) {
      throw new Error('Room not found');
    }

    return this.messageRepository
      .createQueryBuilder('message')
      .where('message.roomId = :roomId', { roomId })
      .orderBy('message.timestamp', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
  }
}
