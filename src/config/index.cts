function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}


const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`)
});

export const Config = {
  PORT: requiredEnv("PORT"),
  NODE_ENV: requiredEnv("NODE_ENV"),
  DB_HOST: requiredEnv("DB_HOST"),
  DB_PORT: requiredEnv("DB_PORT"),
  DB_USERNAME: requiredEnv("DB_USERNAME"),
  DB_PASSWORD: requiredEnv("DB_PASSWORD"),
  DB_NAME: requiredEnv("DB_NAME"),
};
