export interface ICreateCompanyInfoRequest {
  companyName: string;
  email: string;
  phoneNumber: string;
  province: number;
  city: number;
  district: number;
  subDistrict: number;
  fullAddress: string;
  npwp: string;
}

export interface ICreateCompanyInfoResponse {
  id: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  province: string;
  city: string;
  district: string;
  subDistrict: string;
  fullAddress: string;
  postalCode: string;
  npwp: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGetCompanyInfoResponse {
  id: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  province: string;
  city: string;
  district: string;
  subDistrict: string;
  fullAddress: string;
  postalCode: string;
  logoUrl?: string;
  npwp: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpdateCompanyInfoRequest {
  companyName?: string;
  email?: string;
  phoneNumber?: string;
  province?: number;
  city?: number;
  district?: number;
  subDistrict?: number;
  fullAddress?: string;
  npwp?: string;
}

export interface IUpdateCompanyInfoResponse {
  id: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  province: string;
  city: string;
  district: string;
  subDistrict: string;
  fullAddress: string;
  postalCode: string;
  logoUrl?: string;
  npwp: string;
  createdAt: Date;
  updatedAt: Date;
}
