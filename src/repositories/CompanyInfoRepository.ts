import type { Prisma } from '@prisma/client';
import { db } from '../configs/database';

export class CompanyInfoRepository {
  static async create(
    data: Prisma.CompanyInfoCreateInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.companyInfo.create({
      data,
    });
  }

  static async findFirst(tx: Prisma.TransactionClient = db) {
    return tx.companyInfo.findFirst();
  }

  static async update(
    id: string,
    data: Prisma.CompanyInfoUpdateInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.companyInfo.update({
      where: { id },
      data,
    });
  }
}
