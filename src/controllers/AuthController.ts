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
