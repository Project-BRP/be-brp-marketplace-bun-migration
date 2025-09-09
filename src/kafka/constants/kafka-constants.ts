export const KAFKA_CONSTANTS = {
  get KAFKA_CLIENT_ID() {
    return process.env.KAFKA_CLIENT_ID as string;
  },

  get KAFKA_BROKER() {
    const host = process.env.KAFKA_HOST as string;
    const port = process.env.KAFKA_PORT as string;

    return `${host}:${port}`;
  },
};
