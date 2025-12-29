import fs from 'fs';
import path from 'path';
import createHttpError from 'http-errors';
import { Response } from 'express';
import { JwtPayload, sign } from 'jsonwebtoken';
import { Buffer } from 'buffer';
import { Config } from '../config';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';
import { Repository } from 'typeorm';

export class TokenService {
  constructor(private refreshTokenRepo: Repository<RefreshToken>) {}
  createAccessToken(payload: JwtPayload) {
    let privateKey: Buffer;
    try {
      privateKey = fs.readFileSync(
        path.join(process.cwd(), '/certs/private.pem'),
      );
    } catch {
      const error = createHttpError(500, 'Error while reading private key');
      throw error;
    }

    const accessToken = sign(payload as any, privateKey, {
      algorithm: 'RS256',
      expiresIn: '1h',
      issuer: 'auth-register',
    });

    return accessToken;
  }
  createRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET, {
      algorithm: 'HS256',
      expiresIn: '1y',
      issuer: 'auth-service',
      jwtid: String(payload.id),
    });

    return refreshToken;
  }

  async persistRefreshToken(user: User) {
    const YEAR_IN_MS = 1000 * 60 * 60 * 24 * 365;
    const newRefreshToken = await this.refreshTokenRepo.save({
      expiresAt: new Date(Date.now() + YEAR_IN_MS),
      user: user,
    });
    return newRefreshToken;
  }

  storeInCookie(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('accessToken', accessToken, {
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60, //1h
      httpOnly: true, //Very important
    });

    res.cookie('refreshToken', refreshToken, {
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 365, //1 year
      httpOnly: true,
    });
    return;
  }

  async deleteRefreshToken(tokenId: number) {
    return await this.refreshTokenRepo.delete({ id: tokenId });
  }
}
