export const DATABASE_CONSTANTS = {
  get PROVIDER_DB() {
    return process.env.PROVIDER_DB as string;
  },

  get USERNAME_DB() {
    return process.env.USERNAME_DB as string;
  },

  get PASSWORD_DB() {
    return process.env.PASSWORD_DB as string;
  },

  get HOST_DB() {
    return process.env.HOST_DB as string;
  },

  get PORT_DB() {
    return process.env.PORT_DB as string;
  },

  get DATABASE_NAME() {
    return process.env.DATABASE_NAME as string;
  },
};
