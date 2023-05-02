import Room from '../../rooms/entities/room.entity';
import User from '../../users/entities/user.entity';

export class CreateMessageDto {
  content: string;
  user: User;
  room: Room;
  createdAt: Date;
  updatedAt: Date;
}
