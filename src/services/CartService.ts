import { StatusCodes } from 'http-status-codes';

import type {
  IGetCartRequest,
  IGetCartResponse,
  ICartItem,
  IClearCartRequest,
} from '../dtos';
import { ResponseError } from '../error/ResponseError';
import { CartItemRepository, CartRepository } from '../repositories';
import { Validator } from '../utils';
import { CartValidation } from '../validations';

export class CartService {
  static async getCart(request: IGetCartRequest): Promise<IGetCartResponse> {
    const validData = Validator.validate(CartValidation.GET_CART, request);

    const cart = await CartRepository.findByUserId(validData.userId);
    if (!cart) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Keranjang tidak ditemukan',
      );
    }

    return {
      id: cart.id,
      userId: cart.userId,
      items: cart.items.map(item => ({
        id: item.id,
        variantId: item.variantId!,
        quantity: item.quantity,
        productVariant: {
          id: item.variant!.id,
          product: {
            id: item.variant!.product.id,
            name: item.variant!.product.name,
            is_deleted: item.variant!.product.isDeleted,
          },
          weight_in_kg: item.variant!.weight_in_kg,
          packaging: item.variant!.packaging
            ? {
                id: item.variant!.packaging.id,
                name: item.variant!.packaging.name,
              }
            : undefined,
          imageUrl: item.variant!.imageUrl,
          priceRupiah: item.variant!.priceRupiah,
          stock: item.variant!.stock,
          is_deleted: item.variant!.isDeleted,
        },
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })) as ICartItem[],
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  static async clearCart(request: IClearCartRequest): Promise<void> {
    const validData = Validator.validate(CartValidation.CLEAR_CART, request);
    const cart = await CartRepository.findByUserId(validData.userId);

    if (!cart) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Keranjang tidak ditemukan untuk pengguna ini',
      );
    }

    if (cart.items.length === 0) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        'Keranjang sudah kosong',
      );
    }

    await CartItemRepository.deleteByCartId(cart.id);
  }
}
