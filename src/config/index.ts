import { config } from 'dotenv';
config({ debug: true });

const { PORT, NODE_ENV } = process.env;

export const Config = {
  PORT,
  NODE_ENV,
};
