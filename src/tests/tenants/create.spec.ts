import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import request from 'supertest';
import app from '../../app';
import { Tenant } from '../../entity/Tenant';

describe('POST /tenants', () => {
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
      const tenantData = {
        id: 1,
        name: 'Tenant1',
        address: 'Maharashtra,India',
      };
      const res = await request(app).post('/tenants').send(tenantData);
      expect(res.statusCode).toBe(201);
    });

    it('should create an tenant in the database', async () => {
      const tenantData = {
        name: 'Tenant1',
        address: 'Maharashtra,India',
      };
      const res = await request(app).post('/tenants').send(tenantData);
      const tenantRepo = connection.getRepository(Tenant);
      const tenants = await tenantRepo.find();
      expect(tenants).toHaveLength(1);
      expect(res.body.id).toBe(tenants[0]?.id);
    });
  });
});
