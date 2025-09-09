import type { Prisma } from '@prisma/client';
import { db } from '../configs/database';

export class PPNRepository {
  static async findCurrentPPN(tx: Prisma.TransactionClient = db) {
    return tx.currentPPN.findFirst({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updatePPN(
    id: string,
    data: Prisma.CurrentPPNUpdateInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.currentPPN.update({
      where: { id },
      data: data,
    });
  }

  static async createPPN(
    data: Prisma.CurrentPPNCreateInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.currentPPN.create({
      data: data,
    });
  }
}
