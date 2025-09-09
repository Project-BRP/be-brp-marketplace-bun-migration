import { setCookie, deleteCookie } from 'hono/cookie';
import type { Context } from 'hono';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';

import { JWT_CONFIG } from '../constants';
import type {
  IRegisterRequest,
  IVerifyEmailRequest,
  ILoginRequest,
  IGetUserRequest,
  IGetAllUserRequest,
  IUpdateUserRequest,
  IDeleteUserRequest,
  IForgotPasswordRequest,
  ICheckResetTokenRequest,
  IResetPasswordRequest,
} from '../dtos';
import { AuthService } from '../services';
import { SharpUtils, successResponse } from '../utils';

export class AuthController {
  static async register(c: Context): Promise<void> {
    try {
      const request = (await c.req.json()) as IRegisterRequest;
      const response = await AuthService.register(request);

      successResponse(
        c,
        StatusCodes.CREATED,
        'Email verifikasi berhasil dikirim',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async verifyEmail(c: Context): Promise<void> {
    try {
      const request: IVerifyEmailRequest = {
        token: c.req.param('token'),
      };
      const response = await AuthService.verifyEmail(request);

      setCookie(c, 'token', response.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: JWT_CONFIG.JWT_EXPIRES_IN,
      });

      successResponse(c, StatusCodes.OK, 'Verifikasi email berhasil');
    } catch (error) {
      throw error;
    }
  }

  static async login(c: Context): Promise<void> {
    try {
      const request = (await c.req.json()) as ILoginRequest;
      const response = await AuthService.login(request);

      setCookie(c, 'token', response.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: JWT_CONFIG.JWT_EXPIRES_IN,
      });

      successResponse(c, StatusCodes.OK, 'Login Sukses');
    } catch (error) {
      throw error;
    }
  }

  static async getUser(c: Context): Promise<void> {
    try {
      const request: IGetUserRequest = {
        userId: c.get('user').userId,
      };
      const response = await AuthService.getUser(request);

      successResponse(c, StatusCodes.OK, 'Berhasil mendapatkan user', response);
    } catch (error) {
      throw error;
    }
  }

  static async getAllUsers(c: Context): Promise<void> {
    try {
      let isActive: boolean | null = null;
      if (typeof c.req.query('isActive') === 'string') {
        const q = (c.req.query('isActive') as string).toLowerCase();
        if (q === 'true' || q === '1') isActive = true;
        else if (q === 'false' || q === '0') isActive = false;
      }

      const request: IGetAllUserRequest = {
        search: c.req.query('search')
          ? (c.req.query('search') as string)
          : null,
        page: c.req.query('page')
          ? parseInt(c.req.query('page') as string, 10)
          : null,
        limit: c.req.query('limit')
          ? parseInt(c.req.query('limit') as string, 10)
          : null,
        isActive,
      };

      const response = await AuthService.getAll(request);
      successResponse(
        c,
        StatusCodes.OK,
        'Berhasil mendapatkan semua user',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async updateUser(c: Context): Promise<void> {
    let resizedPhotoPath: string | undefined;

    try {
      const body = await c.req.parseBody();
      const file = body['image'] as File | undefined;

      if (file) {
        resizedPhotoPath = await SharpUtils.savePhotoProfile(file);
      }

      const request: IUpdateUserRequest = {
        userId: c.get('user').userId,
        photoProfile: resizedPhotoPath,
        ...Object.fromEntries(
          Object.entries(body).filter(([key]) => key !== 'image'),
        ),
      };

      const response = await AuthService.updateUser(request);
      successResponse(c, StatusCodes.OK, 'Berhasil mengupdate user', response);
    } catch (error) {
      if (resizedPhotoPath && fs.existsSync(resizedPhotoPath)) {
        try {
          await fs.promises.unlink(resizedPhotoPath);
        } catch (e) {
          console.error('Gagal menghapus file upload:', resizedPhotoPath, e);
        }
      }
      throw error;
    }
  }

  static async deleteUser(c: Context): Promise<void> {
    try {
      const request: IDeleteUserRequest = {
        userId: c.get('user').userId,
      };
      await AuthService.deleteUser(request);

      successResponse(c, StatusCodes.OK, 'Berhasil menghapus user');
    } catch (error) {
      throw error;
    }
  }

  static async forgotPassword(c: Context): Promise<void> {
    try {
      const request = (await c.req.json()) as IForgotPasswordRequest;
      await AuthService.forgotPassword(request);

      successResponse(
        c,
        StatusCodes.OK,
        'Berhasil mengirim email reset password',
      );
    } catch (error) {
      throw error;
    }
  }

  static async checkResetToken(c: Context): Promise<void> {
    try {
      const request = (await c.req.json()) as ICheckResetTokenRequest;
      await AuthService.checkResetToken(request);

      successResponse(c, StatusCodes.OK, 'OK');
    } catch (error) {
      throw error;
    }
  }

  static async resetPassword(c: Context): Promise<void> {
    try {
      const request = (await c.req.json()) as IResetPasswordRequest;
      await AuthService.resetPassword(request);

      successResponse(c, StatusCodes.OK, 'Berhasil mereset password');
    } catch (error) {
      throw error;
    }
  }

  static async logout(c: Context): Promise<void> {
    try {
      deleteCookie(c, 'token');
      successResponse(c, StatusCodes.OK, 'Logged out berhasil');
    } catch (error) {
      throw error;
    }
  }
}
