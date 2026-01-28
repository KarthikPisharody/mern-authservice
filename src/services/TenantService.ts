import createHttpError from 'http-errors';
import { Tenant } from '../entity/Tenant';
import { TenantData, TenantQueryParams } from '../types';
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

  async getAll(validatedQuery: TenantQueryParams) {
    const queryBuilder = this.tenantRepository.createQueryBuilder('tenant');
    if (validatedQuery.q) {
      const searchTerm = `%${validatedQuery.q}%`;
      queryBuilder.where("CONCAT(tenant.name,' ',tenant.address) ILIKE :q", {
        q: searchTerm,
      });
    }

    const result = await queryBuilder
      .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
      .take(validatedQuery.perPage)
      .orderBy('tenant.id', 'DESC')
      .getManyAndCount();

    return result;
  }

  async update(id: number, tenantData: TenantData) {
    await this.tenantRepository.update(id, tenantData);
  }

  async delete(id: number) {
    await this.tenantRepository.delete(id);
  }
}
