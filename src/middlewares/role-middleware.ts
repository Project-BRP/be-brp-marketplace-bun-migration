import type { Context, Next } from 'hono';
import { ResponseError } from '../error/ResponseError';

export const roleMiddleware = (allowedRoles: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as { userId: string; role: string } | undefined;
    if (!user || !allowedRoles.includes(user.role)) {
      throw new ResponseError(403, 'Forbidden!');
    }
    await next();
  };
};
