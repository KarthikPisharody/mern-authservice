import { Config } from './config';
import app from './config/app';

const startServer = () => {
  const PORT = Config.PORT;

  try {
    app.listen(PORT, () => {
      console.log(`Auth service is running on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
    console.log(1);
  }
};
startServer();
