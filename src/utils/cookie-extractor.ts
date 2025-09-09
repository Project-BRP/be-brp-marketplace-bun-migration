import type { Context } from 'hono';

export const cookieExtractor = (c: Context) => {
  let token: string | null = null;

  const cookieHeader = c.req.header('Cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=');
        return [name, rest.join('=')];
      }),
    );
    if (cookies['token']) {
      token = cookies['token'];
    }
  }

  return token;
};
