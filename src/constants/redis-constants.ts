export const REDIS_CONSTANTS = {
  get REDIS_HOST() {
    return process.env.REDIS_HOST;
  },
  get REDIS_PORT() {
    return Number(process.env.REDIS_PORT);
  },
  get REDIS_PASSWORD() {
    return process.env.REDIS_PASSWORD;
  },
  get REDIS_DB() {
    return Number(process.env.REDIS_DB);
  },
};
