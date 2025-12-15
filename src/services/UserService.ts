import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { UserData } from '../types';
import createHttpError from 'http-errors';
import { Roles } from '../constants';

export class UserService {
  constructor(private userRepository: Repository<User>) {}
  async create({ name, email, password }: UserData) {
    try {
      const user = await this.userRepository.save({
        name,
        email,
        password,
        role: Roles.CUSTOMER,
      });
      return user;
    } catch {
      const error = createHttpError(
        500,
        'User failed to register in the database',
      );
      throw error;
    }
  }
}
