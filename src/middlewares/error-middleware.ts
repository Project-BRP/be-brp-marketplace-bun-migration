import type { Context } from 'hono';
import { errorResponse } from '../utils/api-response';

// Global error handler
export const errorMiddleware = (err: Error, c: Context) => {
  return errorResponse(c, err);
};
