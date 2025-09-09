import { parse } from 'cookie';

export const socketCookieExtractor = (handshake: any): string | null => {
  let token: string | null = null;

  const cookieHeader = handshake?.headers?.cookie;
  if (typeof cookieHeader === 'string') {
    const cookies = parse(cookieHeader);
    token = cookies['token'] ?? null;
  }

  return token;
};
