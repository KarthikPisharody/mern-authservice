import express, { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import { TenantService } from '../services/TenantService';
import { Tenant } from '../entity/Tenant';
import { TenantController } from '../controllers/TenantController';
import authentication from '../middlewares/authentication';
import { Roles } from '../constants';
import { canAccess } from '../middlewares/canAccess';
import tenantValidator from '../validators/tenant-validator';

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);

const tenantService = new TenantService(tenantRepository);

const tenantController = new TenantController(tenantService, logger);

router.post(
  '/',
  tenantValidator,
  authentication,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.createTenant(req as any, res, next),
);

export default router;
