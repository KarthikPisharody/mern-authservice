import { Config } from './config/index.js';
import app from './app.js';
import logger from './config/logger.js';
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
