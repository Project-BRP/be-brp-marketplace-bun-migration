import type { Prisma } from '@prisma/client';
import { db } from '../configs/database';

export class CartItemRepository {
  static async findById(cartItemId: string) {
    return db.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        variant: true,
      },
    });
  }

  static async findByCartAndVariant(cartId: string, variantId: string) {
    return db.cartItem.findFirst({
      where: {
        cartId,
        variantId,
      },
    });
  }

  static async create(data: Prisma.CartItemCreateInput) {
    return db.cartItem.create({
      data: data,
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  static async update(cartItemId: string, data: Prisma.CartItemUpdateInput) {
    return db.cartItem.update({
      where: { id: cartItemId },
      data: data,
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  static async delete(cartItemId: string) {
    return db.cartItem.delete({
      where: { id: cartItemId },
    });
  }

  static async deleteByCartId(cartId: string) {
    return db.cartItem.deleteMany({
      where: { cartId },
    });
  }
}
