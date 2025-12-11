import request from 'supertest';
import app from '../../app';

describe('POST /auth/register', () => {
  describe('Given all fields', () => {
    it('should return 201 status code', async () => {
      //AAA
      //Arrange
      const userData = {
        name: 'Karthik',
        email: 'karthikpisharody@gmail.com',
        password: 'secret',
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
        password: 'secret',
      };

      const response = await request(app).post('/auth/register').send(userData);

      expect(response.headers['content-type']).toEqual(
        expect.stringContaining('json'),
      );
    });
  });

  describe('Fields are missing', () => {});
});
