import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import logger from '../config/logger';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import authentication from '../middlewares/authentication';
import { canAccess } from '../middlewares/canAccess';
import { Roles } from '../constants';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);

const userService = new UserService(userRepository);

const userController = new UserController(userService, logger);

router.post(
  '/',
  authentication,
  canAccess([Roles.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    userController.create(req as any, res as any, next);
  },
);

router.patch(
  '/:id',
  authentication,
  canAccess([Roles.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    userController.update(req as any, res as any, next);
  },
);

router.delete(
  '/:id',
  authentication,
  canAccess([Roles.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    userController.delete(req as any, res as any, next);
  },
);

export default router;
