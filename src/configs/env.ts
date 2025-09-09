import dotenv from 'dotenv';

import { currentEnv, Env } from '../constants';

function loadEnvPath(): string {
  if (currentEnv === Env.DEVELOPMENT) {
    return Env.DEVELOPMENT_ENV_FILE;
  } else if (currentEnv === Env.PRODUCTION) {
    return Env.PRODUCTION_ENV_FILE;
  } else if (currentEnv === Env.TESTING) {
    return Env.TESTING_ENV_FILE;
  } else {
    return '';
  }
}

const envFile = loadEnvPath();
dotenv.config({ path: envFile });
