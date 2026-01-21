import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import request from 'supertest';
import app from '../../app';

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
  });
});
