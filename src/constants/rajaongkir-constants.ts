export const RAJAONGKIR_CONSTANTS = {
  get API_KEY() {
    return process.env.RAJA_ONGKIR_API_KEY as string;
  },

  get API_URL() {
    return process.env.RAJA_ONGKIR_API_URL as string;
  },
};
