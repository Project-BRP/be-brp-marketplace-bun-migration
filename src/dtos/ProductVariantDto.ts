export interface ICreateProductVariantRequest {
  productId: string;
  weight_in_kg: number;
  packagingId: string;
  imageUrl: string;
  priceRupiah: number;
  stock: number;
}

export interface ICreateProductVariantResponse {
  id: string;
  productId: string;
  weight_in_kg: number;
  packaging?: {
    id: string;
    name: string;
  };
  imageUrl: string;
  priceRupiah: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGetProductVariantRequest {
  id: string;
}

export interface IGetProductVariantResponse {
  id: string;
  productId: string;
  weight_in_kg: number;
  packaging?: {
    id: string;
    name: string;
  };
  imageUrl: string;
  priceRupiah: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGetAllProductVariantsRequest {
  productId: string;
  page?: number;
  limit?: number;
}

export interface IGetAllProductVariantsResponse {
  totalPage: number;
  currentPage: number;
  variants: IGetProductVariantResponse[];
}

export interface IUpdateProductVariantRequest {
  id: string;
  weight_in_kg?: number;
  packagingId?: string;
  imageUrl?: string;
  priceRupiah?: number;
}

export interface IEditStockRequest {
  id: string;
  stock: number;
}

export interface IEditStockResponse {
  id: string;
  productId: string;
  weight_in_kg: number;
  packaging?: {
    id: string;
    name: string;
  };
  imageUrl: string;
  priceRupiah: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpdateProductVariantResponse {
  id: string;
  productId: string;
  weight_in_kg: number;
  packaging: {
    id: string;
    name: string;
  };
  stock: number;
  imageUrl: string;
  priceRupiah: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDeleteProductVariantRequest {
  id: string;
}
