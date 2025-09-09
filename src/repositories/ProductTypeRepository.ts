import type { Prisma } from '@prisma/client';
import { db } from '../configs/database';

export class ProductTypeRepository {
  static async create(
    data: Prisma.ProductTypeCreateInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.productType.create({
      data: data,
    });
  }

  static async findById(id: string, tx: Prisma.TransactionClient = db) {
    return tx.productType.findUnique({
      where: { id },
    });
  }

  static async findByName(name: string, tx: Prisma.TransactionClient = db) {
    return tx.productType.findFirst({
      where: {
        name: name,
      },
    });
  }

  static async findAll(search?: string, tx: Prisma.TransactionClient = db) {
    const searchCondition = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        }
      : {};

    return tx.productType.findMany({
      where: {
        ...searchCondition,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async findAllWithPagination(
    skip: number,
    take: number,
    search?: string,
    tx: Prisma.TransactionClient = db,
  ) {
    const searchCondition = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        }
      : {};

    return tx.productType.findMany({
      where: {
        ...searchCondition,
      },
      skip: skip,
      take: take,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async count(search?: string, tx: Prisma.TransactionClient = db) {
    const searchCondition = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        }
      : {};

    return tx.productType.count({
      where: {
        ...searchCondition,
      },
    });
  }

  static async update(
    id: string,
    data: Prisma.ProductTypeUpdateInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.productType.update({
      where: { id },
      data: data,
    });
  }

  static async delete(id: string, tx: Prisma.TransactionClient = db) {
    return tx.productType.delete({
      where: { id },
    });
  }
}
