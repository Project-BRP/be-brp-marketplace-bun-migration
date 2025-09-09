import type { Context } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';

import { ResponseError } from '../error/ResponseError';
import { appLogger } from '../configs/logger';
import { ContentfulStatusCode } from 'hono/utils/http-status';

export const successResponse = (
  c: Context,
  code: number,
  message: string,
  data?: any,
) => {
  if (data === undefined) {
    return c.json(
      { status: 'success', code, message },
      code as ContentfulStatusCode,
    );
  }
  return c.json(
    { status: 'success', code, message, data },
    code as ContentfulStatusCode,
  );
};

export const errorResponse = (c: Context, error: unknown) => {
  if (error instanceof ResponseError) {
    return c.json(
      { status: 'error', code: error.status, message: error.message },
      error.status as ContentfulStatusCode,
    );
  } else if (error instanceof ZodError) {
    return c.json(
      {
        status: 'error',
        code: StatusCodes.BAD_REQUEST,
        message: error.errors[0].message,
      },
      StatusCodes.BAD_REQUEST,
    );
  } else {
    appLogger.error(error);
    return c.json(
      {
        status: 'error',
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
      },
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};
