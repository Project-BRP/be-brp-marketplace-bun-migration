export const CLIENT_URL = {
  get LOCAL() {
    return process.env.CLIENT_URL_LOCAL as string;
  },

  get DEVELOPMENT() {
    return process.env.CLIENT_URL_DEVELOPMENT as string;
  },

  get PRODUCTION() {
    return process.env.CLIENT_URL_PRODUCTION as string;
  },
};
