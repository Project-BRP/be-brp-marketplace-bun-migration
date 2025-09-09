export const JWT_CONFIG = {
  get JWT_SECRET() {
    return process.env.JWT_SECRET as string;
  },
  get JWT_EXPIRES_IN() {
    return Number(process.env.JWT_EXPIRES_IN);
  },
  get JWT_SECRET_EMAIL_VERIFICATION() {
    return process.env.JWT_SECRET_EMAIL_VERIFICATION as string;
  },
  get JWT_EMAIL_VERIFICATION_EXPIRES_IN() {
    return Number(process.env.JWT_EMAIL_VERIFICATION_EXPIRES_IN);
  },
  get JWT_FORGOT_PASSWORD_SECRET() {
    return process.env.JWT_FORGOT_PASSWORD_SECRET as string;
  },
  get JWT_FORGOT_PASSWORD_EXPIRES_IN() {
    return Number(process.env.JWT_FORGOT_PASSWORD_EXPIRES_IN);
  },
};
