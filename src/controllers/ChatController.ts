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
  static async getAdminPresence(c: Context): Promise<Response> {
    try {
      const isOnline = IoService.isAnyAdminOnline();
      return successResponse(c, StatusCodes.OK, 'Status admin', { isOnline });
    } catch (error) {
      throw error;
    }
  }

  static async getAdminUnreadTotal(c: Context): Promise<Response> {
    try {
      const result = await ChatService.getAdminUnreadTotal();
      return successResponse(
        c,
        StatusCodes.OK,
        'Total unread untuk admin',
        result,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getUserUnreadTotal(c: Context): Promise<Response> {
    try {
      const result = await ChatService.getUserUnreadTotal(
        c.get('user')!.userId,
      );
      return successResponse(
        c,
        StatusCodes.OK,
        'Total unread untuk user',
        result,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getUserPresence(c: Context): Promise<Response> {
    try {
      const userId = c.req.param().userId as string;
      const isOnline = IoService.isUserOnline(userId);
      return successResponse(c, StatusCodes.OK, 'Status user', {
        userId,
        isOnline,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getOnlineUsers(c: Context): Promise<Response> {
    try {
      const users = IoService.getOnlineUsers();
      return successResponse(c, StatusCodes.OK, 'Daftar user online', {
        count: users.length,
        users,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getAllRooms(c: Context): Promise<Response> {
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
      return successResponse(
        c,
        StatusCodes.OK,
        'Daftar chat room berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getRoomDetail(c: Context): Promise<Response> {
    try {
      const request: IGetChatRoomDetailRequest = {
        currentUserId: c.get('user')!.userId,
        currentUserRole: c.get('user')!.role as Role,
        roomId: c.req.param().roomId,
      };

      const response = await ChatService.getRoomDetail(request);
      return successResponse(
        c,
        StatusCodes.OK,
        'Detail chat room berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getRoomDetailByUserId(c: Context): Promise<Response> {
    try {
      const request: IGetChatRoomDetailByUserIdRequest = {
        currentUserId: c.get('user')!.userId,
        currentUserRole: c.get('user')!.role as Role,
        userId: c.get('user')!.userId,
      };

      const response = await ChatService.getRoomDetailByUserId(request);
      return successResponse(
        c,
        StatusCodes.OK,
        'Detail chat room berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async deleteRoom(c: Context): Promise<Response> {
    try {
      const request: IDeleteChatRoomRequest = {
        roomId: c.req.param().roomId,
      };
      await ChatService.deleteRoom(request);
      return successResponse(c, StatusCodes.OK, 'Chat room berhasil dihapus');
    } catch (error) {
      throw error;
    }
  }

  static async createMessage(c: Context): Promise<Response> {
    const attachmentsMeta: {
      url: string;
      mimeType: string;
      sizeBytes: number;
      type: AttachmentType;
      width?: number | null;
      height?: number | null;
    }[] = [];

    try {
      const body = await c.req.parseBody();
      let files = body['attachments'] as File[] | File | undefined;

      if (!Array.isArray(files)) {
        files = files ? [files] : [];
      }

      if (files && files.length > 0) {
        for (const f of files) {
          let saved;
          let attachmentType;

          if (f.type.startsWith('image/')) {
            saved = await SharpUtils.saveChatImage(f);
            attachmentType = AttachmentType.IMAGE;
          } else if (f.type.startsWith('video/')) {
            attachmentType = AttachmentType.VIDEO;
          } else {
            attachmentType = AttachmentType.FILE;
          }

          attachmentsMeta.push({
            url: saved?.path ?? '',
            mimeType: f.type,
            sizeBytes: f.size,
            width: saved?.width,
            height: saved?.height,
            type: attachmentType,
          });
        }
      }

      const request: ICreateChatMessageRequest = {
        currentUserId: c.get('user')?.userId,
        currentUserRole: c.get('user')?.role as Role,
        userId: (c.req.query().userId as string) || null,
        content: String(body['content'] ?? ''),
        attachments: attachmentsMeta,
      };

      const response = await ChatService.createMessage(request);
      return successResponse(
        c,
        StatusCodes.CREATED,
        'Pesan berhasil dikirim',
        response,
      );
    } catch (error) {
      // cleanup kalau ada file yang sudah tersimpan
      for (const att of attachmentsMeta) {
        if (att.url && fs.existsSync(att.url)) {
          try {
            await fs.promises.unlink(att.url);
          } catch (e) {
            console.error('Gagal hapus file:', att.url, e);
          }
        }
      }
      throw error;
    }
  }
}
