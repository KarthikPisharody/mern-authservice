import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import logger from './config/logger';
import { HttpError } from 'http-errors';
import authRouter from './routes/auth';
import tenantRouter from './routes/tenants';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user';

export const app = express();

app.use(express.static('public', { dotfiles: 'allow' }));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello , welcome to the server');
});

app.use('/auth', authRouter);

app.use('/tenants', tenantRouter);

app.use('/users', userRouter);

// global error handler
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  // console.log('FULL ERROR STACK:', err.stack);
  logger.error(err.message);
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        message: err.message,
        path: '',
        location: '',
      },
    ],
  });
});

export default app;
