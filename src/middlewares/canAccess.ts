import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../types';

export const canAccess = (role: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const _req = req as unknown as AuthRequest;
    const roleInToken = _req.auth.role;
    if (!role.includes(roleInToken)) {
      return res
        .status(403)
        .json({ message: 'You do not have required permissions' });
    }
    next();
  };
};
