import type { Prisma } from '@prisma/client';
import { db } from '../configs/database';

export class PackagingRepository {
  static async create(
    data: Prisma.PackagingCreateInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.packaging.create({
      data: data,
    });
  }

  static async findById(id: string, tx: Prisma.TransactionClient = db) {
    return tx.packaging.findUnique({
      where: { id },
    });
  }

  static async findByName(name: string, tx: Prisma.TransactionClient = db) {
    return tx.packaging.findUnique({
      where: { name },
    });
  }

  static async findAll(
    search?: string,
    startDate?: Date,
    endDate?: Date,
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

    const dateCondition = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    return tx.packaging.findMany({
      where: {
        ...searchCondition,
        ...dateCondition,
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
    startDate?: Date,
    endDate?: Date,
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

    const dateCondition = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    return tx.packaging.findMany({
      where: {
        ...searchCondition,
        ...dateCondition,
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

    return tx.packaging.count({
      where: {
        ...searchCondition,
      },
    });
  }

  static async update(
    id: string,
    data: Prisma.PackagingUpdateInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.packaging.update({
      where: { id },
      data: data,
    });
  }

  static async delete(id: string, tx: Prisma.TransactionClient = db) {
    return tx.packaging.delete({
      where: { id },
    });
  }
}
