import { parse } from 'cookie';
import type { Socket } from 'socket.io';

export const socketCookieExtractor = (socket: Socket): string | null => {
  let token: string | null = null;

  const cookieHeader = socket.handshake.headers.cookie;
  if (typeof cookieHeader === 'string') {
    const cookies = parse(cookieHeader);
    token = cookies['token'] ?? null;
  }

  return token;
};