import type { Prisma } from '@prisma/client';
import { db } from '../configs/database';

export class ProductRepository {
  static async create(
    data: Prisma.ProductCreateInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.product.create({
      data: data,
    });
  }

  static async findById(id: string, tx: Prisma.TransactionClient = db) {
    return tx.product.findUnique({
      where: { id, isDeleted: false },
      include: {
        productType: true,
        productVariants: {
          where: { isDeleted: false },
        },
      },
    });
  }

  static async findByName(name: string, tx: Prisma.TransactionClient = db) {
    return tx.product.findFirst({
      where: {
        name: name,
        isDeleted: false,
      },
    });
  }

  static async findAllWithPagination(
    skip: number,
    take: number,
    search?: string,
    productTypeId?: string,
    tx: Prisma.TransactionClient = db,
  ) {
    const whereCondition: Prisma.ProductWhereInput = {
      isDeleted: false,
    };

    if (search) {
      whereCondition.name = {
        contains: search,
        mode: 'insensitive',
      };
    }
    if (productTypeId) {
      whereCondition.productTypeId = productTypeId;
    }

    return tx.product.findMany({
      where: whereCondition,
      skip: skip,
      take: take,
      include: {
        productType: true,
        productVariants: {
          where: { isDeleted: false },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async count(
    search?: string,
    productTypeId?: string,
    tx: Prisma.TransactionClient = db,
  ) {
    const whereCondition: Prisma.ProductWhereInput = {
      isDeleted: false,
    };

    if (search) {
      whereCondition.name = {
        contains: search,
        mode: 'insensitive',
      };
    }
    if (productTypeId) {
      whereCondition.productTypeId = productTypeId;
    }

    return tx.product.count({
      where: whereCondition,
    });
  }

  static async findByType(
    productTypeId: string,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.product.findMany({
      where: {
        productTypeId: productTypeId,
        isDeleted: false,
      },
    });
  }

  static async findAll(
    search?: string,
    productTypeId?: string,
    tx: Prisma.TransactionClient = db,
  ) {
    const whereCondition: Prisma.ProductWhereInput = {
      isDeleted: false,
    };

    if (search) {
      whereCondition.name = {
        contains: search,
        mode: 'insensitive',
      };
    }
    if (productTypeId) {
      whereCondition.productTypeId = productTypeId;
    }

    return tx.product.findMany({
      where: whereCondition,
      include: {
        productType: true,
        productVariants: {
          where: { isDeleted: false },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async update(
    id: string,
    data: Prisma.ProductUpdateInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.product.update({
      where: { id },
      data: data,
    });
  }

  static async delete(id: string, tx: Prisma.TransactionClient = db) {
    return tx.product.delete({
      where: { id },
    });
  }
}
