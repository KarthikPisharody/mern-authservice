import express, { NextFunction, Request, Response } from 'express';
import logger from './logger';
import { HttpError } from 'http-errors';

export const app = express();

app.get('/', (req, res) => {
  res.send('Hello , welcome to the server');
});

// global error handler
app.use(
  // eslint-disable-next-line no-unused-vars
  (err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || 500;
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
  },
);

export default app;
