import { Logger } from 'winston';
import { UserService } from '../services/UserService';
import { NextFunction } from 'express';
import { CreateUserRequest } from '../types';
import { Response } from 'express';
import { Roles } from '../constants';
import createHttpError from 'http-errors';

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
  async delete(req: CreateUserRequest, res: Response, next: NextFunction) {
    const userId = (req as any).params.id;
    if (isNaN(Number(userId))) {
      const error = createHttpError(400, 'Invalid url param.');
      return next(error);
    }
    try {
      await this.userService.deleteUser(Number(userId));
      this.logger.info('User has been deleted', { id: userId });
      res.status(200).json({});
    } catch (err) {
      next(err);
    }
  }
  async update(req: CreateUserRequest, res: Response, next: NextFunction) {
    const { name, email, password } = req.body;
    const userId = (req as any).params.id;
    if (isNaN(Number(userId))) {
      const error = createHttpError(400, 'Invalid url param.');
      return next(error);
    }
    try {
      await this.userService.updateUser(Number(userId), {
        name,
        email,
        password,
        role: Roles.MANAGER,
      });
      this.logger.info('User has been updated', { id: userId });
      res.status(200).json({});
    } catch (err) {
      next(err);
    }
  }
}
