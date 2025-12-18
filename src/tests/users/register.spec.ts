import request from 'supertest';
import app from '../../app';
import { User } from '../../entity/User';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import { Roles } from '../../constants';
import { isJWT } from '../utils';

describe('POST /auth/register', () => {
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
    it('should return 201 status code', async () => {
      //AAA
      //Arrange
      const userData = {
        name: 'Karthik',
        email: 'karthikpisharody@gmail.com',
        password: 'secret1234',
      };
      //Act
      const response = await request(app).post('/auth/register').send(userData);

      //Assert
      expect(response.statusCode).toBe(201);
    });

    it('should return json object', async () => {
      const userData = {
        name: 'Karthik',
        email: 'karthikpisharody@gmail.com',
        password: 'secret1234',
      };

      const response = await request(app).post('/auth/register').send(userData);

      expect(response.headers['content-type']).toEqual(
        expect.stringContaining('json'),
      );
    });

    it('it should have user data in database', async () => {
      //Arrange
      const userData = {
        name: 'Karthik',
        email: 'karthikpisharody@gmail.com',
        password: 'secret1234',
      };

      //Act
      await request(app).post('/auth/register').send(userData);

      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(1);
      expect(users[0]?.name).toBe(userData.name);
      expect(users[0]?.email).toBe(userData.email);
    });

    it('should return the user id', async () => {
      //Arrange
      const userData = {
        name: 'Karthik',
        email: 'karthikpisharody@gmail.com',
        password: 'secret1234',
      };

      //Act
      const response = await request(app).post('/auth/register').send(userData);

      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(response.body.id).toBe(users[0]?.id);
    });

    it('should give customer role', async () => {
      //Arrange
      const userData = {
        name: 'Karthik',
        email: 'karthikpisharody@gmail.com',
        password: 'secret1234',
      };

      //Act
      await request(app).post('/auth/register').send(userData);

      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users[0]).toHaveProperty('role');
      expect(users[0]?.role).toBe(Roles.CUSTOMER);
    });

    it('should store the hashed passwords in the database', async () => {
      //Arrange
      const userData = {
        name: 'Karthik',
        email: 'karthikpisharody@gmail.com',
        password: 'secret1234',
      };

      //Act
      await request(app).post('/auth/register').send(userData);

      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users[0]?.password).not.toBe(userData.password);
      expect(users[0]?.password).toHaveLength(60);
      expect(users[0]?.password).toMatch(/^\$2b\$\d+\$/);
    });

    it('should return 400 status code if email is already used', async () => {
      //Arrange
      const userData = {
        name: 'Karthik',
        email: 'karthikpisharody@gmail.com',
        password: 'secret1234',
      };

      const userRepository = connection.getRepository(User);
      await userRepository.save({ ...userData, role: Roles.CUSTOMER });

      //Act
      const res = await request(app).post('/auth/register').send(userData);
      const users = await userRepository.find();

      //Assert
      expect(res.statusCode).toBe(400);

      expect(users).toHaveLength(1);
    });

    it('should store the access and refresh tokens inside the cookie ', async () => {
      //Arrange
      const userData = {
        name: 'Karthik',
        email: 'karthikpisharody@gmail.com',
        password: 'secret1234',
      };

      //Act
      const res = await request(app).post('/auth/register').send(userData);

      //Assert
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
    });
  });

  describe('Fields are missing', () => {
    it('should return 400 status code if email field is missing', async () => {
      //Arrange
      const userData = {
        name: 'Karthik',
        email: '',
        password: 'secret',
      };

      //Act
      const res = await request(app).post('/auth/register').send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      //Assert
      expect(res.statusCode).toBe(400);
      expect(users).toHaveLength(0);
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    it('should return 400 status code if password is missing', async () => {
      //Arrange
      const userData = {
        name: 'Karthik',
        email: 'karthikpisharody@gmail.com',
        password: '',
      };

      //Act
      const response = await request(app).post('/auth/register').send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      //Assert
      expect(response.status).toBe(400);
      expect(users).toHaveLength(0);
    });

    it('should return 400 status code if name is missing', async () => {
      //Arrange
      const userData = {
        name: '',
        email: 'karthikpisharody@gmail.com',
        password: 'secret1234',
      };

      //Act
      const response = await request(app).post('/auth/register').send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      //Assert
      expect(response.status).toBe(400);
      expect(users).toHaveLength(0);
    });
  });

  describe('Fields are not in proper format', () => {
    it('should trim the email field', async () => {
      //Arrange
      const userData = {
        name: 'Karthik',
        email: ' karthikpisharody@gmail.com ',
        password: 'secret1234',
      };

      //Act
      await request(app).post('/auth/register').send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      //Assert
      expect(users[0]?.email).toBe('karthikpisharody@gmail.com');
    });

    it('should return 400 status code if email is not a valid email', async () => {
      //Arrange
      const userData = {
        name: 'Karthik',
        email: 'karthikpisharodymail.com',
        password: 'secret1234',
      };

      //Act
      const response = await request(app).post('/auth/register').send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      //Assert
      expect(response.status).toBe(400);
      expect(users).toHaveLength(0);
    });

    it('should return 400 status code if password length is less than 8 characters', async () => {
      //Arrange
      const userData = {
        name: 'Karthik',
        email: 'karthikpisharody@gmail.com',
        password: 'secret',
      };

      //Act
      const response = await request(app).post('/auth/register').send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      //Assert
      expect(response.status).toBe(400);
      expect(users).toHaveLength(0);
    });
  });
});
