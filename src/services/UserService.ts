import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { UserData } from '../types';
import createHttpError from 'http-errors';
import { Roles } from '../constants';
import bcrypt from 'bcrypt';

export class UserService {
  constructor(private userRepository: Repository<User>) {}
  async create({ name, email, password }: UserData) {
    const user = await this.userRepository.findOne({ where: { email: email } });
    if (user) {
      const error = createHttpError(400, 'Email already exists');
      throw error;
    }
    //Hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      const user = await this.userRepository.save({
        name,
        email,
        password: hashedPassword,
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
