export interface IAddToCartRequest {
  userId: string;
  variantId: string;
  quantity: number;
}

export interface IAddToCartResponse {
  id: string;
  variantId: string;
  quantity: number;
  productVariant: {
    id: string;
    product: {
      id: string;
      name: string;
    };
    weight_in_kg: number;
    packaging?: {
      id: string;
      name: string;
    };
    imageUrl: string;
    priceRupiah: number;
    stock: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpdateCartItemRequest {
  userId: string;
  cartItemId: string;
  quantity: number;
}

export interface IUpdateCartItemResponse {
  id: string;
  variantId: string;
  quantity: number;
  productVariant: {
    id: string;
    product: {
      id: string;
      name: string;
    };
    weight_in_kg: number;
    packaging?: {
      id: string;
      name: string;
    };
    imageUrl: string;
    priceRupiah: number;
    stock: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IRemoveCartItemRequest {
  userId: string;
  cartItemId: string;
}

export interface ICartItem {
  id: string;
  variantId: string;
  quantity: number;
  productVariant: {
    id: string;
    product: {
      id: string;
      name: string;
      is_deleted: boolean;
    };
    weight_in_kg: number;
    packaging?: {
      id: string;
      name: string;
    };
    imageUrl: string;
    priceRupiah: number;
    stock: number;
    is_deleted: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
