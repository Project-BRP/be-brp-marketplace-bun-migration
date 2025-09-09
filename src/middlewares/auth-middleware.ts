import type { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';

import { ResponseError } from '../error/ResponseError';
import { UserRepository } from '../repositories';
import { JwtToken } from '../utils';
import { cookieExtractor } from '../utils/cookie-extractor';

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const cookieToken = cookieExtractor(c);
    const authHeader = c.req.header('authorization');
    const headerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;

    const token = cookieToken || headerToken;
    if (!token) {
      throw new ResponseError(401, 'Unauthorized!');
    }

    const payload = JwtToken.verifyToken(token);
    const user = await UserRepository.findById(payload.userId);
    if (!user) {
      throw new ResponseError(401, 'Unauthorized!');
    }

    c.set('user', { userId: user.id, role: user.role });
    await next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ResponseError(401, 'Unauthorized!');
    }
    throw error;
  }
};
