import Room from '../../rooms/entities/room.entity';
import User from '../../users/entities/user.entity';

export class CreateMessageDto {
  text: string;
  user: User;
  room: Room;
  createdAt: Date;
  updatedAt: Date;
}
