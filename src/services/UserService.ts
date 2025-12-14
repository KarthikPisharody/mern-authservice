import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { UserData } from '../types';

export class UserService {
  // eslint-disable-next-line no-unused-vars
  constructor(private userRepository: Repository<User>) {}
  async create({ name, email, password }: UserData) {
    await this.userRepository.save({ name, email, password });
  }
}
