import { Context } from 'hono';
import type {
  ICreateChatMessageRequest,
  IDeleteChatRoomRequest,
  IGetAllChatRoomsRequest,
  IGetChatRoomDetailByUserIdRequest,
  IGetChatRoomDetailRequest,
} from '../dtos';
import { StatusCodes } from 'http-status-codes';
import fs from 'fs';

import { ChatService } from '../services/ChatService';
import { successResponse, SharpUtils } from '../utils';
import { AttachmentType, Role } from '../constants';
import { IoService } from '../services/IoService';
import { appLogger } from '../configs/logger';

export class ChatController {
  static async getAdminPresence(c: Context): Promise<void> {
    try {
      const isOnline = IoService.isAnyAdminOnline();
      successResponse(c, StatusCodes.OK, 'Status admin', { isOnline });
    } catch (error) {
      throw error;
    }
  }

  static async getAdminUnreadTotal(c: Context): Promise<void> {
    try {
      const result = await ChatService.getAdminUnreadTotal();
      successResponse(c, StatusCodes.OK, 'Total unread untuk admin', result);
    } catch (error) {
      throw error;
    }
  }

  static async getUserUnreadTotal(c: Context): Promise<void> {
    try {
      const result = await ChatService.getUserUnreadTotal(
        c.get('user')!.userId,
      );
      successResponse(c, StatusCodes.OK, 'Total unread untuk user', result);
    } catch (error) {
      throw error;
    }
  }

  static async getUserPresence(c: Context): Promise<void> {
    try {
      const userId = c.req.param().userId as string;
      const isOnline = IoService.isUserOnline(userId);
      successResponse(c, StatusCodes.OK, 'Status user', { userId, isOnline });
    } catch (error) {
      throw error;
    }
  }

  static async getOnlineUsers(c: Context): Promise<void> {
    try {
      const users = IoService.getOnlineUsers();
      successResponse(c, StatusCodes.OK, 'Daftar user online', {
        count: users.length,
        users,
      });
    } catch (error) {
      throw error;
    }
  }
  static async getAllRooms(c: Context): Promise<void> {
    try {
      const request: IGetAllChatRoomsRequest = {
        search: (c.req.query().search as string) || null,
        page: c.req.query().page
          ? parseInt(c.req.query().page as string, 10)
          : null,
        limit: c.req.query().limit
          ? parseInt(c.req.query().limit as string, 10)
          : null,
      };

      const response = await ChatService.getAllRooms(request);

      successResponse(
        c,
        StatusCodes.OK,
        'Daftar chat room berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getRoomDetail(c: Context): Promise<void> {
    try {
      const request: IGetChatRoomDetailRequest = {
        currentUserId: c.get('user')!.userId,
        currentUserRole: c.get('user')!.role as Role,
        roomId: c.req.param().roomId,
      };

      const response = await ChatService.getRoomDetail(request);
      successResponse(
        c,
        StatusCodes.OK,
        'Detail chat room berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getRoomDetailByUserId(c: Context): Promise<void> {
    try {
      const request: IGetChatRoomDetailByUserIdRequest = {
        currentUserId: c.get('user')!.userId,
        currentUserRole: c.get('user')!.role as Role,
        userId: c.get('user')!.userId,
      };

      const response = await ChatService.getRoomDetailByUserId(request);
      successResponse(
        c,
        StatusCodes.OK,
        'Detail chat room berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async deleteRoom(c: Context): Promise<void> {
    try {
      const request: IDeleteChatRoomRequest = {
        roomId: c.req.param().roomId,
      };
      await ChatService.deleteRoom(request);
      successResponse(c, StatusCodes.OK, 'Chat room berhasil dihapus');
    } catch (error) {
      throw error;
    }
  }

  static async createMessage(c: Context): Promise<void> {
    const attachmentsMeta: {
      url: string;
      mimeType: string;
      sizeBytes: number;
      type: AttachmentType;
      width?: number | null;
      height?: number | null;
    }[] = [];
    try {
      const files = c.get('files') as any;

      if (files && files.length > 0) {
        for (const f of files) {
          let saved;
          let attachmentType;

          if (f.mimetype.startsWith('image/')) {
            saved = await SharpUtils.saveChatImage(f.path);
            attachmentType = AttachmentType.IMAGE;
          } else if (f.mimetype.startsWith('video/')) {
            attachmentType = AttachmentType.VIDEO;
          } else {
            attachmentType = AttachmentType.FILE;
          }

          attachmentsMeta.push({
            url: saved.path,
            mimeType: f.mimetype,
            sizeBytes: f.size,
            width: saved.width,
            height: saved.height,
            type: attachmentType,
          });
        }
      }
      const body = await c.req.json();

      const request: ICreateChatMessageRequest = {
        currentUserId: c.get('user')?.userId,
        currentUserRole: c.get('user')?.role as Role,
        userId: c.req.query().userId as string,
        content: body.content,
        attachments: attachmentsMeta,
      };

      const response = await ChatService.createMessage(request);

      successResponse(
        c,
        StatusCodes.CREATED,
        'Pesan berhasil dikirim',
        response,
      );
    } catch (error) {
      if (attachmentsMeta.length > 0) {
        for (const att of attachmentsMeta) {
          if (att.url && fs.existsSync(att.url)) {
            try {
              await fs.promises.unlink(att.url);
            } catch (e) {
              appLogger.error('Gagal menghapus attachment:', att.url, e);
            }
          }
        }
      }
      throw error;
    }
  }
}
