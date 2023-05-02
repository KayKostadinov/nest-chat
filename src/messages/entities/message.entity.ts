import {
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Room from '../../rooms/entities/room.entity';
import User from '../../users/entities/user.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column()
  public content: string;

  @ManyToOne(() => User, (user) => user.messages, { onDelete: 'CASCADE' })
  @JoinTable()
  public user: User;

  @ManyToOne(() => Room, (room) => room.messages, { onDelete: 'CASCADE' })
  public room: Room;

  @Column()
  public createdAt?: Date;

  @Column()
  public updatedAt?: Date;
}

export default Message;
