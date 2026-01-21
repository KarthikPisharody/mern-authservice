import { Request } from 'supertest';

export interface UserData {
  name: string;
  email: string;
  password: string;
}

export interface TenantData {
  name: string;
  address: string;
}

export interface userRequest extends Request {
  body: UserData;
}

export interface tenantRequest extends Request {
  body: TenantData;
}

export interface AuthRequest extends Omit<Request, 'auth'> {
  auth: {
    sub: number;
    role: string;
    id: string;
  };
}

export interface RefreshTokenPayload {
  id: string;
}
