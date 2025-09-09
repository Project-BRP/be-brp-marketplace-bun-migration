import type { Prisma } from '@prisma/client';
import { ChatSenderType } from '@prisma/client';
import { db } from '../configs/database';

export class ChatMessageRepository {
  static async create(
    data: Prisma.ChatMessageCreateInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.chatMessage.create({
      data,
      include: {
        attachments: true,
      },
    });
  }

  static async findById(id: string, tx: Prisma.TransactionClient = db) {
    return tx.chatMessage.findUnique({
      where: { id },
      include: { attachments: true },
    });
  }

  static async markReadByAdmin(
    roomId: string,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.chatMessage.updateMany({
      where: {
        roomId,
        isReadByAdmin: false,
        senderType: ChatSenderType.USER,
      },
      data: { isReadByAdmin: true },
    });
  }

  static async markReadByUser(
    roomId: string,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.chatMessage.updateMany({
      where: {
        roomId,
        isReadByUser: false,
        senderType: ChatSenderType.ADMIN,
      },
      data: { isReadByUser: true },
    });
  }

  static async countUnreadForAdminByRooms(
    roomIds: string[],
    tx: Prisma.TransactionClient = db,
  ): Promise<Record<string, number>> {
    if (roomIds.length === 0) return {};
    const result = await (tx as any).chatMessage.groupBy({
      by: ['roomId'],
      where: {
        roomId: { in: roomIds },
        isReadByAdmin: false,
        senderType: ChatSenderType.USER,
      },
      _count: { _all: true },
    });
    const map: Record<string, number> = {};
    for (const row of result as Array<{
      roomId: string;
      _count: { _all: number };
    }>) {
      map[row.roomId] = row._count?._all ?? 0;
    }
    // Ensure zero for rooms without entries
    for (const id of roomIds) {
      if (map[id] === undefined) map[id] = 0;
    }
    return map;
  }

  static async countUnreadForAdminTotal(
    tx: Prisma.TransactionClient = db,
  ): Promise<number> {
    return tx.chatMessage.count({
      where: {
        isReadByAdmin: false,
        senderType: ChatSenderType.USER,
      },
    });
  }

  static async countUnreadForUserTotal(
    userId: string,
    tx: Prisma.TransactionClient = db,
  ): Promise<number> {
    return tx.chatMessage.count({
      where: {
        isReadByUser: false,
        senderType: ChatSenderType.ADMIN,
        room: {
          userId,
        },
      },
    });
  }
}
