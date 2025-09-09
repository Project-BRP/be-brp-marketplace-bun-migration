import { Context, Next } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { ResponseError } from '../error/ResponseError';
import { FileTypeUtils, errorResponse } from '../utils';

// ===== Single upload =====
export const uploadMiddleware = async (c: Context, next: Next) => {
  try {
    const body = await c.req.parseBody();
    const file = body['image'] as File | undefined;

    if (file) {
      // cek size (max 5 MB)
      if (file.size > 5 * 1024 * 1024) {
        return errorResponse(
          c,
          new ResponseError(
            StatusCodes.BAD_REQUEST,
            'Gambar tidak boleh lebih dari 5 MB',
          ),
        );
      }

      // cek tipe valid
      const isValid = FileTypeUtils.isValidImage(file);
      if (!isValid) {
        return errorResponse(
          c,
          new ResponseError(StatusCodes.BAD_REQUEST, 'Tipe file tidak valid'),
        );
      }

      // simpan ke context untuk diakses controller
      c.set('file', file);
    }

    await next();
  } catch (e) {
    return errorResponse(
      c,
      new ResponseError(StatusCodes.BAD_REQUEST, 'Gagal memproses file upload'),
    );
  }
};

// ===== Multiple upload =====
export const uploadArraysMiddleware = (fieldName: string, maxCount: number) => {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.parseBody();
      const files = body[fieldName] as File[] | File | undefined;

      const arr = Array.isArray(files) ? files : files ? [files] : [];

      if (arr.length > maxCount) {
        return errorResponse(
          c,
          new ResponseError(
            StatusCodes.BAD_REQUEST,
            `Tidak boleh lebih dari ${maxCount} file`,
          ),
        );
      }

      for (const f of arr) {
        if (f.size > 5 * 1024 * 1024) {
          return errorResponse(
            c,
            new ResponseError(
              StatusCodes.BAD_REQUEST,
              'Tidak boleh ada gambar yang lebih dari 5 MB',
            ),
          );
        }

        if (!FileTypeUtils.isValidImage(f)) {
          return errorResponse(
            c,
            new ResponseError(StatusCodes.BAD_REQUEST, 'Tipe file tidak valid'),
          );
        }
      }

      c.set('files', arr);
      await next();
    } catch (e) {
      return errorResponse(
        c,
        new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Gagal memproses file upload',
        ),
      );
    }
  };
};
