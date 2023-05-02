import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from '../../messages/entities/message.entity';
import Room from '../../rooms/entities/room.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ unique: true })
  public email: string;

  @Column()
  public password: string;

  @ManyToMany(() => Room, (room) => room.users)
  public rooms: Room[];

  @OneToMany(() => Message, (message) => message.user)
  public messages: Message[];
}

export default User;
