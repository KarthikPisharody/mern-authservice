import { NextFunction, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { userRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import { TokenService } from '../services/TokenService';

class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private TokenService: TokenService,
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

      const accessToken = this.TokenService.createAccessToken(payload);

      //Persisting the refresh tokens

      const newRefreshToken = await this.TokenService.persistRefreshToken(user);

      const refreshToken = this.TokenService.createRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
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
