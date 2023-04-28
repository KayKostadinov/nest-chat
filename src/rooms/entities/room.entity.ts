import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import User from '../../users/entities/user.entity';
import { Message } from '../../messages/entities/message.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column()
  public name: string;

  @ManyToMany(() => User, (user) => user.rooms, { eager: true })
  @JoinTable()
  public users: User[];

  @OneToMany(() => Message, (message) => message.room, { cascade: true })
  @JoinTable()
  public messages: Message[];
}

export default Room;
