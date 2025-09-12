export const getAuthCookieBaseOptions = () => {
  const env = process.env.NODE_ENV;
  const isProd = env === 'production';

  return {
    httpOnly: true,
    // Secure cookies only over HTTPS; in dev/testing, disable to allow localhost HTTP
    secure: isProd,
    // Cross-site requires SameSite=None+Secure; use Lax for local dev/testing
    sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
    path: '/',
    // Optionally allow overriding domain via env if needed across subdomains
    domain: process.env.COOKIE_DOMAIN || undefined,
  } as const;
};

