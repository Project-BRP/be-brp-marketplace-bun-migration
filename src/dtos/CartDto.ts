import { ICartItem } from './CartItemDto';

export interface IGetCartRequest {
  userId: string;
}

export interface IGetCartResponse {
  id: string;
  userId: string;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IClearCartRequest {
  userId: string;
}
