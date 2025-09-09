export interface IRegisterRequest {
  email: string;
  name: string;
  password: string;
  phoneNumber: string;
}

export interface IVerifyEmailRequest {
  token: string;
}

export interface IVerifyEmailResponse {
  accessToken: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  accessToken: string;
}

export interface IGetUserRequest {
  userId: string;
}

export interface IGetUserResponse {
  userId: string;
  email: string;
  name: string;
  role: string;
  phoneNumber: string;
  photoProfile?: string;
  totalTransaction?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGetAllUserRequest {
  search?: string;
  page?: number;
  limit?: number;
  isActive?: boolean | null;
}

export interface IGetAllUserResponse {
  totalPage: number;
  currentPage: number;
  users: IGetUserResponse[];
}

export interface IUpdateUserRequest {
  userId: string;
  name?: string;
  email?: string;
  oldPassword?: string;
  password?: string;
  photoProfile?: string;
  phoneNumber?: string;
}

export interface IUpdateUserResponse {
  userId: string;
  name?: string;
  email?: string;
  photoProfile?: string;
  phoneNumber?: string;
}

export interface IDeleteUserRequest {
  userId: string;
}

export interface ITokenPayload {
  userId: string;
}

export interface IEmailVerificationPayload {
  userId: string;
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
}

export interface IForgotTokenPayload {
  email: string;
}

export interface IForgotPasswordRequest {
  email: string;
}

export interface ICheckResetTokenRequest {
  token: string;
}

export interface IResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}
