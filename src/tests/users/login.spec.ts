import { DataSource } from 'typeorm';
import app from '../../app';
import request from 'supertest';
import { AppDataSource } from '../../config/data-source';
import { isJWT } from '../utils';
import { RefreshToken } from '../../entity/RefreshToken';

describe('POST /auth/login', () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });
  describe('Given all fields', () => {
    it('should return 400 status code if email does not exist', async () => {
      const LoginData = {
        email: 'karthikpisharody@gmail.com',
        password: 'secret1234',
      };

      const res = await request(app).post('/auth/login').send(LoginData);

      expect(res.status).toBe(400);
    });

    it('should return 400 status code if email exists but password does not match', async () => {
      const RegisterData = {
        name: 'Karthik',
        email: 'karthikpisharody@gmail.com',
        password: 'secret1234',
      };

      await request(app).post('/auth/register').send(RegisterData);

      const LoginData = {
        email: 'karthikpisharody@gmail.com',
        password: 'secret123',
      };

      const res = await request(app).post('/auth/login').send(LoginData);
      expect(res.status).toBe(400);
    });

    it('should return 200 status code if user logged in', async () => {
      const RegisterData = {
        name: 'Karthik',
        email: 'karthikpisharody@gmail.com',
        password: 'secret1234',
      };

      await request(app).post('/auth/register').send(RegisterData);

      const LoginData = {
        email: 'karthikpisharody@gmail.com',
        password: 'secret1234',
      };

      const res = await request(app).post('/auth/login').send(LoginData);
      expect(res.status).toBe(200);
    });

    it('should return store the tokens inside the cookie', async () => {
      const RegisterData = {
        name: 'Karthik',
        email: 'karthikpisharody@gmail.com',
        password: 'secret1234',
      };

      await request(app).post('/auth/register').send(RegisterData);

      const LoginData = {
        email: 'karthikpisharody@gmail.com',
        password: 'secret1234',
      };

      const res = await request(app).post('/auth/login').send(LoginData);

      let accessToken = null;
      let refreshToken = null;
      interface Headers {
        ['set-cookie']: string[];
      }

      const cookies = (res.headers as unknown as Headers)['set-cookie'] || [];

      cookies.forEach((cookie) => {
        if (cookie.startsWith('accessToken=')) {
          accessToken = cookie.split(';')[0]?.split('=')[1] ?? null;
        } else if (cookie.startsWith('refreshToken=')) {
          refreshToken = cookie.split(';')[0]?.split('=')[1] ?? null;
        }
      });

      expect(accessToken).not.toBeNull();
      expect(refreshToken).not.toBeNull();
      expect(isJWT(accessToken)).toBeTruthy();
      expect(isJWT(refreshToken)).toBeTruthy();
    });

    it('should return store the tokens inside the cookie', async () => {
      const RegisterData = {
        name: 'Karthik',
        email: 'karthikpisharody@gmail.com',
        password: 'secret1234',
      };

      await request(app).post('/auth/register').send(RegisterData);

      const LoginData = {
        email: 'karthikpisharody@gmail.com',
        password: 'secret1234',
      };

      await request(app).post('/auth/login').send(LoginData);

      const res = await request(app).post('/auth/login').send(LoginData);

      const refreshTokenRepo = connection.getRepository(RefreshToken);

      const tokens = await refreshTokenRepo
        .createQueryBuilder('refreshToken')
        .where('refreshToken.userId = :userId', {
          userId: (res.body as Record<string, string>).id,
        })
        .getMany();

      expect(tokens).toHaveLength(3);
    });
  });

  describe('Fields are missing', () => {
    it('should return 400 status code if email field is missing', async () => {
      const LoginData = {
        email: '',
        password: 'secret1234',
      };

      const res = await request(app).post('/auth/login').send(LoginData);
      //Assert
      expect(res.statusCode).toBe(400);
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    it('should return 400 status code if password is missing', async () => {
      //Arrange
      const LoginData = {
        email: 'karthikpisharody@gmail.com',
        password: '',
      };

      //Act
      const res = await request(app).post('/auth/login').send(LoginData);
      //Assert
      expect(res.statusCode).toBe(400);
    });
  });
});
