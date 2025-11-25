import app from './app';
import { getDiscount } from './utils';
import request from 'supertest';

describe('App', () => {
  it('should return correct discount', () => {
    const discount = getDiscount(100, 10);
    expect(discount).toBe(10);
  });

  it('should return 200 status code', async () => {
    const response = await request(app).get('/').send();
    expect(response.statusCode).toBe(200);
  });
});
