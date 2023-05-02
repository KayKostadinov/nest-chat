import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import Room from '../src/rooms/entities/room.entity';
import User from '../src/users/entities/user.entity';
import Message from '../src/messages/entities/message.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let roomRepository: Repository<Room> & any;
  let userRepository: Repository<User> & any;
  let messageRepository: Repository<Message> & any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(Room))
      .useValue(roomRepository)
      .overrideProvider(getRepositoryToken(User))
      .useValue(userRepository)
      .overrideProvider(getRepositoryToken(Message))
      .useValue(messageRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // afterEach(async () => {
  //   await app.close();
  // });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/api/v1/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/users')
      .expect(200)
      .expect('Hello World!');
  });
});
