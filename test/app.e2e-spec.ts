import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { LoginDTO, RegisterDTO } from 'src/auth/auth.dto';
import * as mongoose from 'mongoose';

const app = 'http://localhost:3000';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await mongoose.connection.db.dropDatabase();
});

afterAll(function (done) {
  return mongoose.disconnect(done);
});

describe('ROOT', () => {
  it('should ping', () => {
    return request(app).get('/').expect(200).expect('Hello World!');
  });
});

describe('AUTH', () => {
  it('should register', async () => {
    const user: RegisterDTO = {
      username: 'username',
      password: 'password',
    };

    return request(app)
      .post('/auth/register')
      .set('Accept', 'application/json')
      .send(user)
      .expect(({ body }) => {
        //console.log(body);
        expect(body.token).toBeDefined();
        expect(body.user.username).toEqual('username');
        expect(body.user.password).toBeUndefined();
      })
      .expect(HttpStatus.CREATED);
  });

  it('should reject duplicate registration', async () => {
    const user: RegisterDTO = {
      username: 'username',
      password: 'password',
    };

    return request(app)
      .post('/auth/register')
      .set('Accept', 'application/json')
      .send(user)
      .expect(({ body }) => {
        expect(body.message).toEqual('User already exists');
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('should login', async () => {
    const user: LoginDTO = {
      username: 'username',
      password: 'password',
    };

    return request(app)
      .post('/auth/login')
      .set('Accept', 'application/json')
      .send(user)
      .expect(({ body }) => {
        expect(body.token).toBeDefined();
        expect(body.user.username).toEqual('username');
        expect(body.user.password).toBeUndefined();
      })
      .expect(HttpStatus.CREATED);
  });
});
