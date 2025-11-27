import { Request, Response } from 'express';

class AuthController {
  register(req: Request, res: Response) {
    res.status(201).send();
  }
}

export default AuthController;
