export interface ICreatePackagingRequest {
  name: string;
}

export interface ICreatePackagingResponse {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGetPackagingRequest {
  id: string;
}

export interface IGetPackagingResponse {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGetAllPackagingsRequest {
  search?: string;
  page?: number;
  limit?: number;
}

export interface IGetAllPackagingsResponse {
  totalPage: number;
  currentPage: number;
  packagings: IGetPackagingResponse[];
}

export interface IUpdatePackagingRequest {
  id: string;
  name: string;
}

export interface IUpdatePackagingResponse {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDeletePackagingRequest {
  id: string;
}
