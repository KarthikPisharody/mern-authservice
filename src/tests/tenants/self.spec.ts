import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import request from 'supertest';
import app from '../../app';
import { Tenant } from '../../entity/Tenant';
import nock from 'nock';
import crypto from 'node:crypto';
import { Roles } from '../../constants';
import jwt from 'jsonwebtoken';

describe('GET,PATCH.DELETE /tenants/:id', () => {
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
    it('should return 200 status code', async () => {
      const tenantRepo = connection.getRepository(Tenant);
      const tenant = await tenantRepo.save({
        name: 'Tenant1',
        address: 'Maharashtra,India',
      });

      const adminToken = jwt.sign(
        {
          sub: '1',
          role: Roles.ADMIN,
        },
        privateKey,
        { algorithm: 'RS256', keyid: 'test-key-id' },
      );

      const res = await request(app)
        .get(`/tenants/${tenant.id}`)
        .set('Cookie', [`accessToken=${adminToken}`])
        .send();

      expect(res.status).toBe(200);
    });

    it('should return valid tenant', async () => {
      const tenantRepo = connection.getRepository(Tenant);
      const tenant = await tenantRepo.save({
        name: 'Tenant1',
        address: 'Maharashtra,India',
      });

      const adminToken = jwt.sign(
        {
          sub: '1',
          role: Roles.ADMIN,
        },
        privateKey,
        { algorithm: 'RS256', keyid: 'test-key-id' },
      );

      const res = await request(app)
        .get(`/tenants/${tenant.id}`)
        .set('Cookie', [`accessToken=${adminToken}`])
        .send();

      expect(res.body.name).toBe(tenant.name);
    });

    it('should update tenant properly', async () => {
      const tenantRepo = connection.getRepository(Tenant);
      const tenant1 = await tenantRepo.save({
        name: 'Tenant1',
        address: 'Maharashtra,India',
      });

      const tenant2 = {
        name: 'Tenant2',
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

      await request(app)
        .patch(`/tenants/${tenant1.id}`)
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(tenant2);

      const updatedTenant = await tenantRepo.findOneBy({ id: tenant1.id });
      expect(updatedTenant?.name).toBe(tenant2.name);
    });

    it('should delete tenant properly', async () => {
      const tenantRepo = connection.getRepository(Tenant);
      const tenant = await tenantRepo.save({
        name: 'Tenant1',
        address: 'Maharashtra,India',
      });

      const adminToken = jwt.sign(
        {
          sub: '1',
          role: Roles.ADMIN,
        },
        privateKey,
        { algorithm: 'RS256', keyid: 'test-key-id' },
      );

      await request(app)
        .delete(`/tenants/${tenant.id}`)
        .set('Cookie', [`accessToken=${adminToken}`])
        .send();

      const deletedTenant = await tenantRepo.findOneBy({ id: tenant.id });
      expect(deletedTenant).toBeNull();
    });
  });
});
