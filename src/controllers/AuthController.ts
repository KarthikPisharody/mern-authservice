import { NextFunction, Response } from 'express';
import { userRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';

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

    const accessToken = 'sghgfjiehfueih';
    const refreshToken = 'sjfkghdihffjd';

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

    try {
      const user = await this.userService.create({ name, email, password });

      this.logger.info('User has been registered');
      res.status(201).json({ id: user.id });
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
