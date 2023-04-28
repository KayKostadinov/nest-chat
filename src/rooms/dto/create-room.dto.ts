import Message from '../../messages/entities/message.entity';
import User from '../../users/entities/user.entity';

export class CreateRoomDto {
  name: string;
  users?: User[];
  messages?: Message[];
}
