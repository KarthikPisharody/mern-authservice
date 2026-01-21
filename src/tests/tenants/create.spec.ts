import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import request from 'supertest';
import app from '../../app';
import { Tenant } from '../../entity/Tenant';
import nock from 'nock';
import { Roles } from '../../constants';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

describe('POST /tenants', () => {
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
    it('should return 201 status code', async () => {
      const tenantData = {
        id: 1,
        name: 'Tenant1',
        address: 'Maharashtra,India',
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
        .post('/tenants')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(tenantData);
      expect(res.statusCode).toBe(201);
    });

    it('should create an tenant in the database', async () => {
      const tenantData = {
        name: 'Tenant1',
        address: 'Maharashtra,India',
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
        .post('/tenants')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(tenantData);

      const tenantRepo = connection.getRepository(Tenant);
      const tenants = await tenantRepo.find();
      expect(tenants).toHaveLength(1);
      expect(res.body.id).toBe(tenants[0]?.id);
    });

    it('should return 401 status code if the user is not authenticated', async () => {
      const tenantData = {
        name: 'Tenant1',
        address: 'Maharashtra,India',
      };

      const res = await request(app).post('/tenants').send(tenantData);
      const tenantRepo = connection.getRepository(Tenant);
      const tenants = await tenantRepo.find();
      expect(tenants).toHaveLength(0);
      expect(res.statusCode).toBe(401);
    });
  });
});
