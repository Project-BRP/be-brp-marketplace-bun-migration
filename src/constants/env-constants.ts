export enum Env {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TESTING = 'testing',
  DEVELOPMENT_ENV_FILE = '.env.development',
  PRODUCTION_ENV_FILE = '.env.production',
  TESTING_ENV_FILE = '.env.testing',
}

export const currentEnv = process.env.NODE_ENV;
