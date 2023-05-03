import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import Message from '../src/messages/entities/message.entity';
import Room from '../src/rooms/entities/room.entity';
import User from '../src/users/entities/user.entity';

let app: INestApplication;
let token: string;
describe('AppController (e2e)', () => {
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('/api/v1');
    await app.init();

    const testUser = {
      email: 'testuser@example.com',
      password: 'testpassword',
    };

    const signUpResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/signup')
      .send(testUser)
      .expect((res) => {
        expect(res.body.id).toEqual(1);
        expect(res.body.email).toEqual(testUser.email);
      });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send(testUser)
      .expect((res) => {
        expect(res.body.id).toEqual(1);
        expect(res.body.email).toEqual(testUser.email);
      });

    token = loginResponse.headers['set-cookie'][0]?.split(';')[0].split('=')[1];
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Users (e2e)', () => {
    it('/api/v1/users (POST)', () => {
      const createUserDto = {
        email: 'testuser2@example.com',
        password: 'testpass2',
      };
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .send(createUserDto)
        .expect(201);
    });

    it('/api/v1/users/:id (GET)', async () => {
      const createUserDto = {
        email: 'testuser3@example.com',
        password: 'testpass3',
      };
      const { body: createdUser } = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(createUserDto);

      return request(app.getHttpServer())
        .get(`/api/v1/users/${createdUser.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toEqual(createdUser.id);
          expect(res.body.email).toEqual(createUserDto.email);
        });
    });
  });

  describe('Rooms (e2e)', () => {
    console.log('token in rooms', { token });

    it('/rooms (POST)', async () => {
      const createRoomDto = {
        name: 'Test Room',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/rooms')
        .set('Authentication', `${token}`)
        .send(createRoomDto)
        .expect(201);

      expect(response.body.name).toEqual(createRoomDto.name);
      expect(response.body.id).toBeDefined();
    });

    it('/rooms (GET)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/rooms')
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);
    });

    it('/rooms/:id (GET)', async () => {
      const roomId = 1;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/rooms/${roomId}`)
        .expect(200);

      expect(response.body.id).toEqual(roomId);
    });

    it('/rooms/:roomId/users/:userId (POST)', async () => {
      const roomId = 1;
      const userId = 2;

      await request(app.getHttpServer())
        .post(`/api/v1/rooms/${roomId}/users/${userId}`)
        .set('Authentication', `${token}`)
        .expect(201);
    });

    it('/rooms/:roomId/users/:userId (DELETE)', async () => {
      const roomId = 1;
      const userId = 2;

      await request(app.getHttpServer())
        .delete(`/api/v1/rooms/${roomId}/users/${userId}`)
        .set('Authentication', `${token}`)
        .expect(200);
    });
  });
});
