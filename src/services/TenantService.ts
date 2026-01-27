import createHttpError from 'http-errors';
import { Tenant } from '../entity/Tenant';
import { TenantData } from '../types';
import { Repository } from 'typeorm';

export class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) {}

  async create({ name, address }: TenantData) {
    try {
      const tenant = await this.tenantRepository.save({ name, address });
      return tenant;
    } catch {
      const error = createHttpError(
        400,
        'Tenant could not be created in the database',
      );
      throw error;
    }
  }

  async findById(id: number) {
    return await this.tenantRepository.findOne({
      where: {
        id,
      },
    });
  }

  async update(id: number, tenantData: TenantData) {
    await this.tenantRepository.update(id, tenantData);
  }

  async delete(id: number) {
    await this.tenantRepository.delete(id);
  }
}
