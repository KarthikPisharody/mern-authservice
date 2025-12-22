import 'reflect-metadata';
import { Config } from './config/index.js';
import app from './app.js';
import logger from './config/logger.js';
import { AppDataSource } from './config/data-source.js';

const startServer = async () => {
  const PORT = Config.PORT;

  try {
    await AppDataSource.initialize();
    logger.info('Database connected successfully');
    app.listen(PORT, () => {
      logger.info(`Auth service running on port`, { port: PORT });
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  }
};
startServer();
