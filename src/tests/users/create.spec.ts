import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import request from 'supertest';
import app from '../../app';
import nock from 'nock';
import { Roles } from '../../constants';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { User } from '../../entity/User';

describe('POST /users', () => {
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
    it('should persist user in the database', async () => {
      const userData = {
        name: 'Karthik',
        email: 'karthikpisharody@gmail.com',
        password: 'secret1234',
      };

      const adminToken = jwt.sign(
        {
          sub: '1',
          role: Roles.ADMIN,
        },
        privateKey,
        { algorithm: 'RS256', keyid: 'test-key-id' },
      );

      const res = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(userData);

      const userRepo = connection.getRepository(User);
      const users = await userRepo.find();
      expect(res.status).toBe(201);
      expect(users).toHaveLength(1);
      expect(res.body.id).toBe(users[0]?.id);
    });
  });
});
