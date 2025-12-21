import express, { Request, Response, NextFunction } from 'express';
import AuthController from '../controllers/AuthController';
import { UserService } from '../services/UserService';
import { User } from '../entity/User';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import registerValidator from '../validators/register-validator';
import { TokenService } from '../services/TokenService';
import { RefreshToken } from '../entity/RefreshToken';

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);

const tokenService = new TokenService(refreshTokenRepo);

const userService = new UserService(userRepository);

const authController = new AuthController(userService, logger, tokenService);

router.post(
  '/register',
  registerValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.register(req as any, res, next),
);

export default router;
