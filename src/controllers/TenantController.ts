import { NextFunction, Response, Request } from 'express';
import { tenantRequest } from '../types';
import { TenantService } from '../services/TenantService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';

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

  async findTenant(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.params.id;

    if (isNaN(Number(tenantId))) {
      next(createHttpError(400, 'Invalid url param.'));
      return;
    }

    try {
      const tenant = await this.tenantService.findById(Number(tenantId));
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found!' });
      }
      res.status(200).json(tenant);
    } catch (err) {
      next(err);
      return;
    }
  }

  async updateTenant(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.params.id;
    const { name, address } = req.body;

    if (isNaN(Number(tenantId))) {
      next(createHttpError(400, 'Invalid url param.'));
      return;
    }

    this.logger.debug('Request for updating a tenant', { body: req.body });
    try {
      await this.tenantService.update(Number(tenantId), {
        name,
        address,
      });
      this.logger.info('Tenant has been updated', {
        name: name,
        address: address,
      });

      res.json({ id: Number(tenantId) });
    } catch (err) {
      next(err);
      return;
    }
  }

  async deleteTenant(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.params.id;

    if (isNaN(Number(tenantId))) {
      next(createHttpError(400, 'Invalid url param.'));
      return;
    }

    this.logger.debug('Request for deleting a tenant', { body: req.body });
    try {
      await this.tenantService.delete(Number(tenantId));
      this.logger.info('Tenant has been deleted', { id: tenantId });

      res.json({ id: Number(tenantId) });
    } catch (err) {
      next(err);
      return;
    }
  }
}
