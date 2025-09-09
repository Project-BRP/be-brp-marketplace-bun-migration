import { CLIENT_URL } from '../constants/client-url-constants';

const currentEnv = process.env.NODE_ENV;
let clientUrl;

if (currentEnv === 'development') {
  clientUrl = CLIENT_URL.DEVELOPMENT;
} else if (currentEnv === 'production') {
  clientUrl = CLIENT_URL.PRODUCTION;
} else if (currentEnv === 'testing') {
  clientUrl = CLIENT_URL.LOCAL;
}

export const CLIENT_URL_CURRENT = clientUrl;
