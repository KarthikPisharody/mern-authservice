import { Logger } from 'winston';
import { UserService } from '../services/UserService';
import { NextFunction } from 'express';
import { CreateUserRequest } from '../types';
import { Response } from 'express';
import { Roles } from '../constants';

export class UserController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}

  async create(req: CreateUserRequest, res: Response, next: NextFunction) {
    const { name, email, password } = req.body;

    try {
      const user = await this.userService.create({
        name,
        email,
        password,
        role: Roles.MANAGER,
      });
      this.logger.info('User has been created', { id: user.id });
      res.status(201).json({ id: user.id });
    } catch (err) {
      next(err);
    }
  }
}
