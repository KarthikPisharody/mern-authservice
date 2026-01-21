import { NextFunction, Response } from 'express';
import { tenantRequest } from '../types';
import { TenantService } from '../services/TenantService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';

export class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger,
  ) {}
  async createTenant(req: tenantRequest, res: Response, next: NextFunction) {
    const result = validationResult(req as any);

    if (!result.isEmpty()) {
      return res.status(400).json({
        errors: result.array(),
      });
    }

    try {
      const { name, address } = req.body;

      const tenant = await this.tenantService.create({ name, address });

      this.logger.info('Tenant has been created', { id: tenant.id });

      res.status(201).json({ id: tenant.id });
    } catch (err) {
      next(err);
    }
  }
}
