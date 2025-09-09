import type { Prisma } from '@prisma/client';
import { db } from '../configs/database';

export class TransactionItemRepository {
  static async findById(id: string, tx: Prisma.TransactionClient = db) {
    return tx.transactionItem.findUnique({
      where: { id },
      include: {
        variant: {
          include: {
            product: true,
            packaging: true,
          },
        },
      },
    });
  }
  static async create(
    data: Prisma.TransactionItemCreateInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.transactionItem.create({
      data: data,
      include: {
        variant: {
          include: {
            product: true,
            packaging: true,
          },
        },
      },
    });
  }

  static async createMany(
    data: Prisma.TransactionItemCreateManyInput[],
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.transactionItem.createMany({
      data: data,
    });
  }

  static async updateById(
    id: string,
    data: Prisma.TransactionItemUpdateInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.transactionItem.update({
      where: { id: id },
      data: data,
    });
  }

  static async findMany(
    where: Prisma.TransactionItemWhereInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.transactionItem.findMany({
      where: where,
      orderBy: { createdAt: 'asc' },
    });
  }

  static async findManyCustom(
    where: Prisma.TransactionItemWhereInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.transactionItem.findMany({
      where: where,
      orderBy: { createdAt: 'desc' },
    });
  }
}
