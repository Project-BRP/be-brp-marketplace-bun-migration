import type { Prisma } from '@prisma/client';
import { db } from '../configs/database';

export class CartRepository {
  static async create(
    data: Prisma.CartCreateInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.cart.create({
      data: data,
    });
  }

  static async findByUserId(userId: string, tx: Prisma.TransactionClient = db) {
    return tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                packaging: true,
                product: true,
              },
            },
          },
        },
      },
    });
  }
}
