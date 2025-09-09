import type { Prisma } from '@prisma/client';
import { db } from '../configs/database';

export class ChatRoomRepository {
  static async findByUserId(userId: string, tx: Prisma.TransactionClient = db) {
    return tx.chatRoom.findFirst({ where: { userId } });
  }

  static async findById(id: string, tx: Prisma.TransactionClient = db) {
    return tx.chatRoom.findUnique({ where: { id } });
  }

  static async findByIdWithMessages(
    id: string,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.chatRoom.findUnique({
      where: { id },
      include: {
        user: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            attachments: true,
          },
        },
      },
    });
  }

  static async findByUserIdWithMessages(
    userId: string,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.chatRoom.findFirst({
      where: { userId },
      include: {
        user: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            attachments: true,
          },
        },
      },
    });
  }

  static async create(
    data: Prisma.ChatRoomCreateInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.chatRoom.create({ data });
  }

  static async update(
    id: string,
    data: Prisma.ChatRoomUpdateInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.chatRoom.update({ where: { id }, data });
  }

  static async delete(id: string, tx: Prisma.TransactionClient = db) {
    return tx.chatRoom.delete({ where: { id } });
  }

  static async countAll(search?: string, tx: Prisma.TransactionClient = db) {
    const searchCondition = search
      ? {
          user: {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
              {
                phoneNumber: {
                  contains: search,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
            ],
          },
        }
      : {};

    return tx.chatRoom.count({ where: { ...searchCondition } });
  }

  static async findAll(search?: string, tx: Prisma.TransactionClient = db) {
    const searchCondition = search
      ? {
          user: {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
              {
                phoneNumber: {
                  contains: search,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
            ],
          },
        }
      : {};

    return tx.chatRoom.findMany({
      where: { ...searchCondition },
      include: { user: true },
      orderBy: [{ lastMessageAt: 'desc' }, { createdAt: 'desc' }],
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
          user: {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
              {
                phoneNumber: {
                  contains: search,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
            ],
          },
        }
      : {};

    return tx.chatRoom.findMany({
      where: { ...searchCondition },
      include: { user: true },
      skip,
      take,
      orderBy: [{ lastMessageAt: 'desc' }, { createdAt: 'desc' }],
    });
  }
}
