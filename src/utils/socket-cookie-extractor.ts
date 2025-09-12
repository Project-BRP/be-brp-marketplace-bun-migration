import { parse } from 'cookie';
import type { Socket } from 'socket.io';

export const socketCookieExtractor = (socket: Socket | any): string | null => {
  let cookieHeader: unknown = socket?.handshake?.headers?.cookie;

  if (!cookieHeader) {
    const h = socket?.request?.headers;
    if (h) {
      if (typeof h.get === 'function') {
        // Fetch Headers (Bun)
        cookieHeader = h.get('cookie') || h.get('x-cookie-bridge'); // 👈 fallback bridge
      } else {
        // Node-style plain object
        cookieHeader = h.cookie || (h['x-cookie-bridge'] as any); // 👈 fallback bridge
      }
    }
  }

  // 🔎 TERAKHIR: langsung dari handshake.headers bila berbentuk Headers (tidak enumerable)
  if (!cookieHeader) {
    const hh = socket?.handshake?.headers;
    if (hh && typeof hh.get === 'function') {
      cookieHeader = hh.get('cookie') || hh.get('x-cookie-bridge');
      console.log('[cookieHeader-last]', cookieHeader);
    }
  }

  // Log untuk verifikasi
  console.log('[cookieHeader]', cookieHeader);

  if (typeof cookieHeader === 'string' && cookieHeader.length > 0) {
    const cookies = parse(cookieHeader);
    return cookies['token'] ?? null;
  }
  return null;
};
