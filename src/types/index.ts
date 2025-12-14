import { Request } from 'supertest';

export interface UserData {
  name: string;
  email: string;
  password: string;
}

export interface userRequest extends Request {
  body: UserData;
}
