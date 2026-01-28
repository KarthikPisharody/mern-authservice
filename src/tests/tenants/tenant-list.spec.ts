import request from 'supertest';
import app from '../../app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import { Tenant } from '../../entity/Tenant';
describe('GET /tenants', () => {
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

  describe('Given some fields', () => {
    it('should return 200 status code', async () => {
      const response = await request(app).get('/tenants').send();
      expect(response.status).toBe(200);
    });

    it('should return valid list of tenants', async () => {
      const tenant1 = {
        name: 'Tenant1',
        address: 'Address1',
      };
      const tenant2 = {
        name: 'Tenant2',
        address: 'Address2',
      };
      const tenantRepository = connection.getRepository(Tenant);
      await tenantRepository.save(tenant1);
      await tenantRepository.save(tenant2);
      const response = await request(app).get('/tenants?q=Tenant1').send();
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe('Tenant1');
    });

    it('should return valid list of tenants-2', async () => {
      const tenant1 = {
        name: 'Tenant1',
        address: 'Address1',
      };
      const tenant2 = {
        name: 'Tenant2',
        address: 'Address1',
      };
      const tenantRepository = connection.getRepository(Tenant);
      await tenantRepository.save(tenant1);
      await tenantRepository.save(tenant2);
      const response = await request(app)
        .get('/tenants?q=Address1&perPage=2&currentPage=1')
        .send();
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.total).toBe(2);
    });
  });
});
