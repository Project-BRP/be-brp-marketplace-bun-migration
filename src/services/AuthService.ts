import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import path from 'path';
import { v4 as uuid } from 'uuid';

import { JWT_CONFIG } from '../constants';
import type {
  IRegisterRequest,
  IVerifyEmailRequest,
  IVerifyEmailResponse,
  ILoginRequest,
  ILoginResponse,
  IGetUserRequest,
  IGetUserResponse,
  IGetAllUserRequest,
  IGetAllUserResponse,
  IUpdateUserRequest,
  IUpdateUserResponse,
  IDeleteUserRequest,
  IForgotPasswordRequest,
  ICheckResetTokenRequest,
  IResetPasswordRequest,
  IEmailVerificationPayload,
} from '../dtos';
import { ResponseError } from '../error/ResponseError';
import {
  UserRepository,
  ResetTokenRepository,
  VerifyEmailRepository,
  CartRepository,
  TransactionRepository,
} from '../repositories';
import { JwtToken, PasswordUtils, Validator } from '../utils';
import { CLIENT_URL_CURRENT } from '../utils/client-url-utils';
import { AuthValidation } from '../validations';
import { db } from '../configs/database';
import { EmailUtils } from '../utils';

export class AuthService {
  static async register(request: IRegisterRequest) {
    const validData = Validator.validate(AuthValidation.REGISTER, request);

    const user = await UserRepository.findByEmail(validData.email);
    if (user) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Email sudah ada');
    }

    const hashedPassword = await PasswordUtils.hashPassword(validData.password);
    const userId = 'USR-' + uuid();

    const payload: IEmailVerificationPayload = {
      userId,
      email: validData.email,
      name: validData.name,
      password: hashedPassword,
      phoneNumber: validData.phoneNumber,
    };

    const emailVerificationToken =
      JwtToken.generateEmailVerificationToken(payload);

    await EmailUtils.sendVerificationEmail(payload, emailVerificationToken);

    await VerifyEmailRepository.set(
      validData.email,
      emailVerificationToken,
      JWT_CONFIG.JWT_EMAIL_VERIFICATION_EXPIRES_IN,
    );
  }

  static async verifyEmail(
    request: IVerifyEmailRequest,
  ): Promise<IVerifyEmailResponse> {
    const validData = Validator.validate(AuthValidation.VERIFY_EMAIL, request);
    const token = validData.token;

    try {
      const decoded = JwtToken.verifyEmailVerificationToken(token);

      const result = await db.$transaction(async tx => {
        const user = await UserRepository.findById(decoded.userId, tx);
        if (user) {
          throw new ResponseError(
            StatusCodes.BAD_REQUEST,
            'User sudah terverifikasi',
          );
        }

        const validEmailToken = await VerifyEmailRepository.get(decoded.email);
        if (!validEmailToken || validEmailToken !== token) {
          throw new ResponseError(StatusCodes.UNAUTHORIZED, 'Unauthorized!');
        }

        const newUser = await UserRepository.create(
          {
            id: decoded.userId,
            email: decoded.email,
            name: decoded.name,
            password: decoded.password,
            phoneNumber: decoded.phoneNumber,
          },
          tx,
        );

        await CartRepository.create(
          {
            id: 'CRT-' + uuid(),
            user: {
              connect: { id: newUser.id },
            },
          },
          tx,
        );

        const payload = { userId: newUser.id };
        const accessToken = JwtToken.generateAccessToken(payload);

        await VerifyEmailRepository.delete(decoded.email);

        return { accessToken };
      });

      return result;
    } catch (error) {
      if (error instanceof ResponseError) throw error;
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ResponseError(StatusCodes.UNAUTHORIZED, 'Unauthorized!');
      }

      throw new ResponseError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
      );
    }
  }

  static async login(request: ILoginRequest): Promise<ILoginResponse> {
    const validData = Validator.validate(AuthValidation.LOGIN, request);

    const user = await UserRepository.findByEmail(validData.email);
    if (!user) {
      throw new ResponseError(
        StatusCodes.UNAUTHORIZED,
        'Email atau password salah',
      );
    }

    const isValidPassword = await PasswordUtils.comparePassword(
      validData.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new ResponseError(
        StatusCodes.UNAUTHORIZED,
        'Email atau password salah',
      );
    }

    const payload = { userId: user.id };
    const accessToken = JwtToken.generateAccessToken(payload);

    return { accessToken };
  }

  static async getUser(request: IGetUserRequest): Promise<IGetUserResponse> {
    const user = await UserRepository.findById(request.userId);
    if (!user) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'User tidak ditemukan');
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      photoProfile: user.profilePicture,
      phoneNumber: user.phoneNumber,
      totalTransaction: user._count?.transaction || 0,
      isActive: user.transaction.length > 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static async getAll(
    request: IGetAllUserRequest,
  ): Promise<IGetAllUserResponse> {
    const validData = Validator.validate(AuthValidation.GET_ALL_USER, request);
    const take = validData.limit;
    const skip = (validData.page - 1) * take;
    const search = validData.search;
    const isActive = validData.isActive ?? null;

    if (!take || !validData.page) {
      const users = await UserRepository.findAll(search, isActive);
      return {
        totalPage: 1,
        currentPage: 1,
        users: users.map(user => ({
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phoneNumber: user.phoneNumber,
          photoProfile: user.profilePicture,
          totalTransaction: user._count?.transaction || 0,
          isActive: user.transaction.length > 0,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
      };
    }

    const totalUsers = await UserRepository.count(search, isActive);
    if (totalUsers === 0) {
      return {
        totalPage: 1,
        currentPage: 1,
        users: [],
      };
    }

    if (skip >= totalUsers) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Halaman tidak valid');
    }

    const users = await UserRepository.findAllWithPagination(
      skip,
      take,
      search,
      isActive,
    );
    const totalPage = Math.ceil(totalUsers / take);
    const currentPage = Math.ceil(skip / take) + 1;

    return {
      totalPage,
      currentPage,
      users: users.map(user => ({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        photoProfile: user.profilePicture,
        totalTransaction: user._count?.transaction || 0,
        isActive: user.transaction.length > 0,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    };
  }

  static async updateUser(
    request: IUpdateUserRequest,
  ): Promise<IUpdateUserResponse> {
    const validData = Validator.validate(AuthValidation.UPDATE, request);

    const user = await UserRepository.findById(request.userId);
    if (!user) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'User tidak ditemukan');
    }

    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      profilePicture?: string;
      phoneNumber?: string;
    } = {};

    if (validData.photoProfile) {
      updateData.profilePicture = validData.photoProfile;
      if (user.profilePicture) {
        const assetDir = process.env.UPLOADS_PATH;
        const imagePath = path.join(assetDir, user.profilePicture);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }
    }

    if (validData.name) updateData.name = validData.name;

    if (validData.email) {
      const existingUser = await UserRepository.findByEmail(validData.email);
      if (existingUser && existingUser.id !== request.userId) {
        throw new ResponseError(StatusCodes.BAD_REQUEST, 'Email sudah ada');
      }
      updateData.email = validData.email;
    }

    if (validData.phoneNumber) updateData.phoneNumber = validData.phoneNumber;

    if (validData.password) {
      const isValidPassword = await PasswordUtils.comparePassword(
        validData.oldPassword,
        user.password,
      );

      if (!isValidPassword) {
        throw new ResponseError(
          StatusCodes.UNAUTHORIZED,
          'Password lama salah',
        );
      }

      updateData.password = await PasswordUtils.hashPassword(
        validData.password,
      );
    }

    const updatedUser = await UserRepository.update(request.userId, updateData);

    return {
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      photoProfile: updatedUser.profilePicture,
    };
  }

  static async deleteUser(request: IDeleteUserRequest): Promise<void> {
    const user = await UserRepository.findById(request.userId);
    if (!user) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'User tidak ditemukan');
    }

    await UserRepository.delete(request.userId);
  }

  static async forgotPassword(request: IForgotPasswordRequest): Promise<void> {
    const validData = Validator.validate(
      AuthValidation.FORGOT_PASSWORD,
      request,
    );

    const user = await UserRepository.findByEmail(validData.email);
    if (!user) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'User tidak ditemukan');
    }

    const token = JwtToken.generateForgotPasswordToken({ email: user.email });
    const resetLink = `${CLIENT_URL_CURRENT}/forget-password/${token}`;

    await EmailUtils.sendResetPasswordEmail(user.email, resetLink);

    await ResetTokenRepository.set(
      user.id,
      token,
      JWT_CONFIG.JWT_FORGOT_PASSWORD_EXPIRES_IN,
    );
  }

  static async checkResetToken(
    request: ICheckResetTokenRequest,
  ): Promise<void> {
    const validData = Validator.validate(
      AuthValidation.CHECK_RESET_TOKEN,
      request,
    );
    const token = validData.token;

    try {
      const decoded = JwtToken.verifyForgotPasswordToken(token);

      const user = await UserRepository.findByEmail(decoded.email);
      if (!user) {
        throw new ResponseError(StatusCodes.NOT_FOUND, 'User tidak ditemukan');
      }

      const validResetToken = await ResetTokenRepository.get(user.id);
      if (validResetToken !== token) {
        throw new ResponseError(StatusCodes.UNAUTHORIZED, 'Unauthorized!');
      }
    } catch (error) {
      if (error instanceof ResponseError) throw error;
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ResponseError(StatusCodes.UNAUTHORIZED, 'Unauthorized!');
      }

      throw new ResponseError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
      );
    }
  }

  static async resetPassword(request: IResetPasswordRequest): Promise<void> {
    const validData = Validator.validate(
      AuthValidation.RESET_PASSWORD,
      request,
    );
    const token = validData.token;

    try {
      const decoded = JwtToken.verifyForgotPasswordToken(token);
      const user = await UserRepository.findByEmail(decoded.email);
      if (!user) {
        throw new ResponseError(StatusCodes.NOT_FOUND, 'User tidak ditemukan');
      }

      const validResetToken = await ResetTokenRepository.get(user.id);
      if (validResetToken !== token) {
        throw new ResponseError(StatusCodes.UNAUTHORIZED, 'Unauthorized!');
      }

      const hashedPassword = await PasswordUtils.hashPassword(
        validData.password,
      );
      await UserRepository.update(user.id, { password: hashedPassword });
      await ResetTokenRepository.delete(user.id);
    } catch (error) {
      if (error instanceof ResponseError) throw error;
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ResponseError(StatusCodes.UNAUTHORIZED, 'Unauthorized!');
      }

      throw new ResponseError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
      );
    }
  }
}
