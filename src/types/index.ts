import { Request } from 'supertest';

export interface UserData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface TenantData {
  name: string;
  address: string;
}

export interface findTenantReq {
  body: {
    id: string;
  };
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

export interface TenantQueryParams {
  q: string;
  currentPage: number;
  perPage: number;
}

export interface CreateUserRequest extends Request {
  body: {
    name: string;
    email: string;
    password: string;
  };
}
