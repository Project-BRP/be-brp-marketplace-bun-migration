import type { Prisma } from '@prisma/client';
import { db } from '../configs/database';

export class ChatAttachmentRepository {
  static async createMany(
    data: Prisma.ChatAttachmentCreateManyInput[],
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.chatAttachment.createMany({ data });
  }
}
