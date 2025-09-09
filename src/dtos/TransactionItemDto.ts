import { IGetProductVariantResponse } from './ProductVariantDto';

export interface ITransactionItem {
  variantId: string;
  weight_in_kg: number;
  packaging: string;
  productId: string;
  quantity: number;
  priceRupiah: number;
  productName: string;
}

export interface IAddTransactionItemRequest {
  transactionId: string;
  variantId: string;
  quantity: number;
}

export interface IAddTransactionItemResponse {
  id: string;
  transactionId: string;
  variantId: string;
  quantity: number;
  priceRupiah: number;
  productVariant: IGetProductVariantResponse;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRemoveTransactionItemRequest {
  transactionId: string;
  transactionItemId: string;
}

export interface IResolveStockIssueRequest {
  transactionItemId: string;
  stock: number;
}

export interface IResolveStockIssueResponse {
  id: string;
  transactionId: string;
  variantId: string;
  quantity: number;
  priceRupiah: number;
  productVariant: IGetProductVariantResponse;
  createdAt: Date;
  updatedAt: Date;
}
