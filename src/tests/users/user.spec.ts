import { DataSource } from 'typeorm';
import app from '../../app';
import request from 'supertest';
import nock from 'nock';
import { AppDataSource } from '../../config/data-source';
import { User } from '../../entity/User';
import { Roles } from '../../constants';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

describe('POST /auth/self', () => {
  let connection: DataSource;
  let privateKey: any;
  let publicKey: any;

  beforeAll(async () => {
    const { privateKey: priv, publicKey: pub } = crypto.generateKeyPairSync(
      'rsa',
      {
        modulusLength: 2048,
      },
    );
    privateKey = priv.export({ type: 'pkcs8', format: 'pem' });
    const jwk = pub.export({ format: 'jwk' });

    publicKey = {
      ...jwk,
      kid: 'test-key-id',
      alg: 'RS256',
      use: 'sig',
    };

    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    nock('http://localhost:5555')
      .persist()
      .get('/.well-known/jwks.json')
      .reply(200, { keys: [publicKey] });

    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe('Given all fields', () => {
    it('should return the 200 status code', async () => {
      const accessToken = jwt.sign(
        {
          sub: '1',
          role: Roles.CUSTOMER,
        },
        privateKey,
        { algorithm: 'RS256', keyid: 'test-key-id' },
      );

      const res = await request(app)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send();

      expect(res.status).toBe(200);
    });

    it('should return the user data', async () => {
      //Register the user
      const userData = {
        name: 'Karthik',
        email: 'karthikpisharody@gmail.com',
        password: 'secret1234',
      };

      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });
      //Generate token
      const accessToken = jwt.sign(
        {
          sub: String(data.id),
          role: data.role,
        },
        privateKey,
        { algorithm: 'RS256', keyid: 'test-key-id' },
      );

      //Add token to cookie
      const res = await request(app)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send();

      //Assert
      //Check if user id matches with the registered user
      expect(res.body.id).toBe(data.id);
    });

    it('should exclude password from user data', async () => {
      //Register the user
      const userData = {
        name: 'Karthik',
        email: 'karthikpisharody@gmail.com',
        password: 'secret1234',
      };

      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });
      //Generate token
      const accessToken = jwt.sign(
        {
          sub: String(data.id),
          role: data.role,
        },
        privateKey,
        { algorithm: 'RS256', keyid: 'test-key-id' },
      );

      //Add token to cookie
      const res = await request(app)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send();

      //Assert
      //Check if user id matches with the registered user
      expect(res.body).not.toHaveProperty('password');
    });

    it('should return 401 status code if token does not exist', async () => {
      //Register the user
      const userData = {
        name: 'Karthik',
        email: 'karthikpisharody@gmail.com',
        password: 'secret1234',
      };

      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });

      //Add token to cookie
      const res = await request(app).get('/auth/self').send();

      //Assert
      //Check if user id matches with the registered user
      expect(res.status).toBe(401);
    });
  });
});
