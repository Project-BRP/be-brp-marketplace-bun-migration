import { Role } from '../constants';
import { io } from '../index';
import { MsgSender } from '../dtos';
import { ChatSenderType } from '@prisma/client';

export class IoService {
  static async emitNewTransaction(): Promise<void> {
    io.emit('newTransaction');
  }

  static async emitTransaction(): Promise<void> {
    io.emit('transactions');
  }

  static async emitChatMessage(
    roomId: string,
    userId?: string,
    sentBy?: ChatSenderType,
    readBy?: Role,
    isAdminNotifed?: boolean,
  ): Promise<void> {
    if (userId) {
      io.to(`user:${userId}`).emit('chat:message', { roomId });
      if (
        (sentBy && sentBy !== (MsgSender.USER as ChatSenderType)) ||
        readBy === Role.USER
      ) {
        io.to(`user:${userId}`).emit('chat:message:all');
      }
    }
    if (isAdminNotifed) {
      io.to('admins').emit('chat:message', { roomId });
      if (
        (sentBy && sentBy !== (MsgSender.ADMIN as ChatSenderType)) ||
        readBy === Role.ADMIN
      ) {
        io.to('admins').emit('chat:message:all');
      }
    }
  }

  static isUserOnline(userId: string): boolean {
    try {
      const room = io.sockets.adapter.rooms.get(`user:${userId}`);
      return !!(room && room.size > 0);
    } catch {
      return false;
    }
  }

  static isAnyAdminOnline(): boolean {
    try {
      for (const [, socket] of io.sockets.sockets) {
        const data: any = (socket as any).data;
        if (data?.user?.role === Role.ADMIN) return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  static getOnlineUsers(): { userId: string }[] {
    try {
      const onlineSet = new Set<string>();
      for (const [, socket] of io.sockets.sockets) {
        const data: any = (socket as any).data;
        const userId: string | undefined = data?.user?.userId;
        const role = data?.user?.role;
        if (userId && role !== Role.ADMIN) {
          onlineSet.add(userId);
        }
      }
      return Array.from(onlineSet).map(userId => ({ userId }));
    } catch {
      return [];
    }
  }
}
