import { NextFunction, Response } from 'express';
import { userRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';

class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}

  async register(req: userRequest, res: Response, next: NextFunction) {
    const { name, email, password } = req.body;

    this.logger.debug('Request to create user with data', { name, email });
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
