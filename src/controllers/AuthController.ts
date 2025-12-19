import fs from 'fs';
import path from 'path';
import createHttpError from 'http-errors';
import { NextFunction, Response } from 'express';
import { JwtPayload, sign } from 'jsonwebtoken';
import { userRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import { Buffer } from 'buffer';
import { Config } from '../config';

class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}

  async register(req: userRequest, res: Response, next: NextFunction) {
    //Validation
    const result = validationResult(req as any);
    if (!result.isEmpty()) {
      return res.status(400).json({
        errors: result.array(),
      });
    }

    const { name, email, password } = req.body;
    this.logger.debug('Request to create user with data', { name, email });

    try {
      const user = await this.userService.create({ name, email, password });

      this.logger.info('User has been registered');

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      let privateKey: Buffer;
      try {
        privateKey = fs.readFileSync(
          path.join(process.cwd(), '/certs/private.pem'),
        );
      } catch {
        const error = createHttpError(500, 'Error while reading private key');
        next(error);
        return;
      }

      const accessToken = sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '1h',
        issuer: 'auth-register',
      });

      const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET, {
        algorithm: 'HS256',
        expiresIn: '1y',
        issuer: 'auth-service',
      });

      res.cookie('accessToken', accessToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60, //1h
        httpOnly: true, //Very important
      });

      res.cookie('refreshToken', refreshToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 365, //1 year
        httpOnly: true,
      });

      res.status(201).json({ id: user.id });
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
