import { parse } from 'cookie';
import type { Socket } from 'socket.io';

export const socketCookieExtractor = (socket: Socket | any): string | null => {
  // 1) Coba dari handshake (umum di Socket.IO)
  let cookieHeader: unknown = socket?.handshake?.headers?.cookie;

  // 2) Fallback: dari request (bun-engine dapat memberi Fetch Headers)
  if (!cookieHeader) {
    const h = socket?.request?.headers;
    if (h) {
      if (typeof h.get === 'function') {
        // Fetch Headers (Bun)
        cookieHeader = h.get('cookie');
      } else {
        // Node-style plain object
        cookieHeader = h.cookie;
      }
    }
  }

  if (typeof cookieHeader === 'string' && cookieHeader.length > 0) {
    const cookies = parse(cookieHeader);
    return cookies['token'] ?? null;
  }
  return null;
};
