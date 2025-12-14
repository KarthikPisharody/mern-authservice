import { Response } from 'express';
import { userRequest } from '../types';
import { UserService } from '../services/UserService';

class AuthController {
  // eslint-disable-next-line no-unused-vars
  constructor(private userService: UserService) {}

  async register(req: userRequest, res: Response) {
    const { name, email, password } = req.body;
    await this.userService.create({ name, email, password });
    res.status(201).json();
  }
}

export default AuthController;
