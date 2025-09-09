import type { Prisma } from '@prisma/client';
import { db } from '../configs/database';

export class ProductVariantRepository {
  static async create(
    data: Prisma.ProductVariantCreateInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.productVariant.create({
      data: data,
      include: { packaging: true },
    });
  }

  static async findById(id: string, tx: Prisma.TransactionClient = db) {
    return tx.productVariant.findUnique({
      where: { id, isDeleted: false },
      include: { packaging: true },
    });
  }

  static async findMany(ids: string[], tx: Prisma.TransactionClient = db) {
    return tx.productVariant.findMany({
      where: {
        id: { in: ids },
        isDeleted: false,
      },
      include: { packaging: true },
    });
  }

  static async findByProduct(
    productId: string,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.productVariant.findMany({
      where: {
        productId: productId,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
      include: { packaging: true },
    });
  }

  static async findAll(tx: Prisma.TransactionClient = db) {
    return tx.productVariant.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: { packaging: true },
    });
  }

  static async findByProductWithPagination(
    skip: number,
    take: number,
    productId: string,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.productVariant.findMany({
      where: {
        productId: productId,
        isDeleted: false,
      },
      skip: skip,
      take: take,
      orderBy: { createdAt: 'desc' },
      include: { packaging: true },
    });
  }

  static async count(productId: string, tx: Prisma.TransactionClient = db) {
    return tx.productVariant.count({
      where: {
        productId: productId,
        isDeleted: false,
      },
    });
  }

  static async update(
    id: string,
    data: Prisma.ProductVariantUpdateInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.productVariant.update({
      where: { id, isDeleted: false },
      data: data,
      include: { packaging: true },
    });
  }

  static async updateByProductId(
    productId: string,
    data: Prisma.ProductVariantUpdateInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.productVariant.updateMany({
      where: { productId, isDeleted: false },
      data: data,
    });
  }

  static async delete(id: string, tx: Prisma.TransactionClient = db) {
    return tx.productVariant.delete({
      where: { id },
      include: { packaging: true },
    });
  }
}
