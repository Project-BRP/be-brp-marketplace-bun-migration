import { parse as parseCookie } from 'cookie';

function getHeaderCaseInsensitive(
  headers: any,
  name: string,
): string | string[] | undefined {
  if (!headers) return undefined;

  // 1) Headers (Fetch API)
  if (typeof headers.get === 'function') {
    // Headers.get() sudah case-insensitive
    return headers.get(name) ?? undefined;
  }

  // 2) Plain object (Node-style)
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === name.toLowerCase()) {
      const v = (headers as any)[key];
      return Array.isArray(v) ? v : String(v);
    }
  }

  return undefined;
}

export const socketCookieExtractor = (handshake: any): string | null => {
  const raw = getHeaderCaseInsensitive(handshake?.headers, 'cookie');
  if (!raw) return null;

  const cookieStr = Array.isArray(raw) ? raw.join('; ') : String(raw);
  const cookies = parseCookie(cookieStr);
  return cookies['token'] ?? null;
};
