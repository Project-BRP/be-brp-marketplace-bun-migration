import { StatusCodes } from 'http-status-codes';
import { v4 as uuid } from 'uuid';

import type {
  IAddToCartRequest,
  IUpdateCartItemRequest,
  IUpdateCartItemResponse,
  IRemoveCartItemRequest,
  IAddToCartResponse,
} from '../dtos/CartItemDto';
import { ResponseError } from '../error/ResponseError';
import {
  CartRepository,
  CartItemRepository,
  ProductVariantRepository,
} from '../repositories';
import { Validator } from '../utils';
import { CartItemValidation } from '../validations';

export class CartItemService {
  static async addToCart(
    request: IAddToCartRequest,
  ): Promise<IAddToCartResponse> {
    const validData = Validator.validate(
      CartItemValidation.ADD_TO_CART,
      request,
    );

    const productVariant = await ProductVariantRepository.findById(
      validData.variantId,
    );
    if (!productVariant) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Varian produk tidak ditemukan',
      );
    }

    const cart = await CartRepository.findByUserId(validData.userId);
    if (!cart) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Keranjang tidak ditemukan untuk pengguna ini',
      );
    }

    const existingCartItem = await CartItemRepository.findByCartAndVariant(
      cart.id,
      validData.variantId,
    );

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + validData.quantity;
      if (newQuantity > productVariant.stock) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Stok produk tidak mencukupi',
        );
      }
      if (newQuantity <= 0) {
        await CartItemRepository.delete(existingCartItem.id);
      } else {
        const updatedCartItem = await CartItemRepository.update(
          existingCartItem.id,
          {
            quantity: newQuantity,
          },
        );
        return {
          id: updatedCartItem.id,
          variantId: updatedCartItem.variantId!,
          quantity: updatedCartItem.quantity,
          productVariant: {
            id: productVariant.id,
            product: {
              id: updatedCartItem.variant.product.id,
              name: updatedCartItem.variant.product.name,
            },
            weight_in_kg: productVariant.weight_in_kg,
            packaging: productVariant.packaging
              ? {
                  id: productVariant.packaging.id,
                  name: productVariant.packaging.name,
                }
              : undefined,
            imageUrl: productVariant.imageUrl,
            priceRupiah: productVariant.priceRupiah,
            stock: productVariant.stock,
          },
          createdAt: updatedCartItem.createdAt,
          updatedAt: updatedCartItem.updatedAt,
        };
      }
    } else {
      if (validData.quantity <= 0) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Kuantitas harus lebih dari 0 untuk menambah item baru',
        );
      }
      if (validData.quantity > productVariant.stock) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Stok produk tidak mencukupi',
        );
      }

      const newCartItem = await CartItemRepository.create({
        id: 'CIT-' + uuid(),
        cart: { connect: { id: cart.id } },
        variant: { connect: { id: validData.variantId } },
        quantity: validData.quantity,
      });

      return {
        id: newCartItem.id,
        variantId: newCartItem.variantId!,
        quantity: newCartItem.quantity,
        productVariant: {
          id: productVariant.id,
          product: {
            id: newCartItem.variant.product.id,
            name: newCartItem.variant.product.name,
          },
          weight_in_kg: productVariant.weight_in_kg,
          packaging: productVariant.packaging
            ? {
                id: productVariant.packaging.id,
                name: productVariant.packaging.name,
              }
            : undefined,
          imageUrl: productVariant.imageUrl,
          priceRupiah: productVariant.priceRupiah,
          stock: productVariant.stock,
        },
        createdAt: newCartItem.createdAt,
        updatedAt: newCartItem.updatedAt,
      };
    }
  }

  static async updateCartItem(
    request: IUpdateCartItemRequest,
  ): Promise<IUpdateCartItemResponse> {
    const validData = Validator.validate(
      CartItemValidation.UPDATE_CART_ITEM,
      request,
    );

    const cart = await CartRepository.findByUserId(validData.userId);
    if (!cart) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Keranjang tidak ditemukan untuk pengguna ini',
      );
    }

    const cartItem = await CartItemRepository.findById(validData.cartItemId);
    if (!cartItem || cartItem.cartId !== cart.id) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Item keranjang tidak ditemukan',
      );
    }

    const productVariant = await ProductVariantRepository.findById(
      cartItem.variantId!,
    );
    if (!productVariant) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Varian produk tidak ditemukan',
      );
    }

    const newQuantity = cartItem.quantity + validData.quantity;

    if (newQuantity > productVariant.stock) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        'Stok produk tidak mencukupi',
      );
    }

    if (newQuantity <= 0) {
      await CartItemRepository.delete(cartItem.id);
      return;
    }

    const updatedCartItem = await CartItemRepository.update(
      validData.cartItemId,
      { quantity: newQuantity },
    );

    return {
      id: updatedCartItem.id,
      variantId: updatedCartItem.variantId!,
      quantity: updatedCartItem.quantity,
      productVariant: {
        id: productVariant.id,
        product: {
          id: updatedCartItem.variant.product.id,
          name: updatedCartItem.variant.product.name,
        },
        weight_in_kg: productVariant.weight_in_kg,
        packaging: productVariant.packaging
          ? {
              id: productVariant.packaging.id,
              name: productVariant.packaging.name,
            }
          : undefined,
        imageUrl: productVariant.imageUrl,
        priceRupiah: productVariant.priceRupiah,
        stock: productVariant.stock,
      },
      createdAt: updatedCartItem.createdAt,
      updatedAt: updatedCartItem.updatedAt,
    };
  }

  static async removeCartItem(request: IRemoveCartItemRequest): Promise<void> {
    const validData = Validator.validate(
      CartItemValidation.REMOVE_CART_ITEM,
      request,
    );

    const cart = await CartRepository.findByUserId(validData.userId);
    if (!cart) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Keranjang tidak ditemukan untuk pengguna ini',
      );
    }

    const cartItem = await CartItemRepository.findById(validData.cartItemId);
    if (!cartItem || cartItem.cartId !== cart.id) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Item keranjang tidak ditemukan',
      );
    }

    await CartItemRepository.delete(validData.cartItemId);
  }
}
