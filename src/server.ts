import { Config } from './config/index.cjs';
import app from './app';
import logger from './config/logger';
const startServer = () => {
  const PORT = Config.PORT;

  try {
    app.listen(PORT, () => {
      logger.info(`Auth service running on port`, { port: PORT });
    });
  } catch (err) {
    ``;
    console.error(err);
    console.log(1);
  }
};
startServer();
