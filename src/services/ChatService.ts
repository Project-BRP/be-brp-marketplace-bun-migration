import { StatusCodes } from 'http-status-codes';
import { v4 as uuid } from 'uuid';
import { ChatSenderType } from '@prisma/client';
import fs from 'fs';

import type {
  ICreateChatMessageRequest,
  ICreateChatMessageResponse,
  IGetAllChatRoomsRequest,
  IGetAllChatRoomsResponse,
  IGetChatRoomDetailRequest,
  IGetChatRoomDetailResponse,
  IDeleteChatRoomRequest,
  IGetChatRoomDetailByUserIdRequest,
  IGetTotalUnreadMessagesAdminResponse,
} from '../dtos';
import { ResponseError } from '../error/ResponseError';
import { db as database } from '../configs/database';
import {
  ChatAttachmentRepository,
  ChatMessageRepository,
  ChatRoomRepository,
  UserRepository,
} from '../repositories';
import { Validator, TimeUtils } from '../utils';
import { ChatValidation } from '../validations/ChatValidation';
import { AttachmentType, Role } from '../constants';
import { IoService } from './IoService';
import { appLogger } from '../configs/logger';

export class ChatService {
  static async createMessage(
    request: ICreateChatMessageRequest,
  ): Promise<ICreateChatMessageResponse> {
    const db = database;

    const validData = Validator.validate(ChatValidation.CREATE_MESSAGE, {
      userId: request.userId,
      content: request.content,
    });

    const senderId = request.currentUserId;
    const senderRole = request.currentUserRole;

    const targetUserId =
      senderRole === Role.ADMIN ? validData.userId : request.currentUserId;
    if (!targetUserId) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        'User ID tujuan wajib diisi untuk admin',
      );
    }

    const targetUser = await UserRepository.findById(targetUserId);
    if (!targetUser) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'User tujuan tidak ditemukan',
      );
    }

    const now = TimeUtils.now();

    const created = await db.$transaction(async tx => {
      let room = await ChatRoomRepository.findByUserId(targetUserId, tx);
      if (!room) {
        room = await ChatRoomRepository.create(
          {
            id: 'CHR-' + uuid(),
            user: { connect: { id: targetUserId } },
            lastMessageAt: now,
          },
          tx,
        );
      }

      const hasAttachments = (request.attachments || []).length > 0;
      if (
        !hasAttachments &&
        (!validData.content || validData.content.trim().length === 0)
      ) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Konten pesan atau lampiran harus ada',
        );
      }

      const message = await ChatMessageRepository.create(
        {
          id: 'CHM-' + uuid(),
          room: { connect: { id: room.id } },
          sender: { connect: { id: senderId } },
          senderType:
            senderRole === Role.ADMIN
              ? ChatSenderType.ADMIN
              : ChatSenderType.USER,
          content: validData.content?.trim() || null,
          hasAttachments,
          isReadByUser: senderRole === Role.ADMIN ? false : true,
          isReadByAdmin: senderRole === Role.ADMIN ? true : false,
        },
        tx,
      );

      if (hasAttachments) {
        await ChatAttachmentRepository.createMany(
          (request.attachments || []).map(att => ({
            id: 'CHA-' + uuid(),
            messageId: message.id,
            type: att.type,
            url: att.url,
            mimeType: att.mimeType,
            sizeBytes: att.sizeBytes,
            width: att.width ?? null,
            height: att.height ?? null,
          })),
          tx,
        );
      }

      await ChatRoomRepository.update(
        room.id,
        {
          lastMessageAt: now,
        },
        tx,
      );

      const fullMessage = await ChatMessageRepository.findById(message.id, tx);

      return { room, message: fullMessage! };
    });

    IoService.emitChatMessage(
      created.room.id,
      created.room.userId,
      created.message.senderType,
      undefined,
      true,
    );

    return {
      roomId: created.room.id,
      message: {
        id: created.message.id,
        roomId: created.message.roomId,
        senderId: created.message.senderId,
        senderType: created.message.senderType,
        content: created.message.content,
        hasAttachments: created.message.hasAttachments,
        isReadByUser: created.message.isReadByUser,
        isReadByAdmin: created.message.isReadByAdmin,
        createdAt: created.message.createdAt,
        updatedAt: created.message.updatedAt,
        attachments: (created.message.attachments || []).map(att => ({
          id: att.id,
          url: att.url,
          mimeType: att.mimeType,
          type: att.type as AttachmentType,
          sizeBytes: att.sizeBytes,
          width: att.width ?? undefined,
          height: att.height ?? undefined,
          createdAt: att.createdAt,
          updatedAt: att.updatedAt,
        })),
      },
    };
  }

  static async getAllRooms(
    request: IGetAllChatRoomsRequest,
  ): Promise<IGetAllChatRoomsResponse> {
    const validData = Validator.validate(ChatValidation.GET_ALL_ROOMS, request);

    const take = validData.limit ?? undefined;
    const page = validData.page ?? undefined;
    const skip = take && page ? (page - 1) * take : undefined;
    const search = validData.search ?? undefined;

    if (!take || !page) {
      const rooms = await ChatRoomRepository.findAll(search);
      const roomIds = rooms.map(r => r.id);
      const unreadMap =
        await ChatMessageRepository.countUnreadForAdminByRooms(roomIds);
      return {
        totalPage: 1,
        currentPage: 1,
        rooms: rooms.map(r => ({
          id: r.id,
          user: {
            id: r.user.id,
            email: r.user.email,
            name: r.user.name,
            phoneNumber: r.user.phoneNumber,
            role: r.user.role,
            profilePicture: r.user.profilePicture ?? null,
          },
          lastMessageAt: r.lastMessageAt ?? null,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          totalUnreadMessages: unreadMap[r.id] ?? 0,
        })),
      };
    }

    const total = await ChatRoomRepository.countAll(search);
    if (total === 0) {
      return { totalPage: 1, currentPage: 1, rooms: [] };
    }

    if (skip! >= total) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Halaman tidak valid');
    }

    const rooms = await ChatRoomRepository.findAllWithPagination(
      skip!,
      take,
      search,
    );
    const roomIds = rooms.map(r => r.id);
    const unreadMap =
      await ChatMessageRepository.countUnreadForAdminByRooms(roomIds);

    const totalPage = Math.ceil(total / take);
    const currentPage = Math.ceil(skip! / take) + 1;

    return {
      totalPage,
      currentPage,
      rooms: rooms.map(r => ({
        id: r.id,
        user: {
          id: r.user.id,
          email: r.user.email,
          name: r.user.name,
          phoneNumber: r.user.phoneNumber,
          role: r.user.role,
          profilePicture: r.user.profilePicture ?? null,
        },
        lastMessageAt: r.lastMessageAt ?? null,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        totalUnreadMessages: unreadMap[r.id] ?? 0,
      })),
    };
  }

  static async getAdminUnreadTotal(): Promise<IGetTotalUnreadMessagesAdminResponse> {
    const total = await ChatMessageRepository.countUnreadForAdminTotal();
    return { totalUnreadMessages: total };
  }

  static async getUserUnreadTotal(
    userId: string,
  ): Promise<IGetTotalUnreadMessagesAdminResponse> {
    const total = await ChatMessageRepository.countUnreadForUserTotal(userId);
    return { totalUnreadMessages: total };
  }

  static async getRoomDetail(
    request: IGetChatRoomDetailRequest,
  ): Promise<IGetChatRoomDetailResponse> {
    const validData = Validator.validate(ChatValidation.GET_ROOM_DETAIL, {
      roomId: request.roomId,
    });

    let room = await ChatRoomRepository.findByIdWithMessages(validData.roomId);
    if (!room) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Ruang chat tidak ditemukan',
      );
    }

    if (
      request.currentUserRole !== Role.ADMIN &&
      room.userId !== request.currentUserId
    ) {
      throw new ResponseError(StatusCodes.FORBIDDEN, 'Tidak memiliki akses');
    }
    let updatedMessages;
    try {
      if (request.currentUserRole === Role.ADMIN) {
        updatedMessages = await ChatMessageRepository.markReadByAdmin(
          validData.roomId,
        );
        if (updatedMessages.count > 0) {
          try {
            await IoService.emitChatMessage(
              validData.roomId,
              room.userId,
              undefined,
              Role.ADMIN,
              true,
            );
          } catch {}
        }
      } else {
        updatedMessages = await ChatMessageRepository.markReadByUser(
          validData.roomId,
        );
        if (updatedMessages.count > 0) {
          try {
            await IoService.emitChatMessage(
              room.id,
              undefined,
              undefined,
              Role.USER,
              true,
            );
          } catch {}
        }
      }
      room = await ChatRoomRepository.findByIdWithMessages(validData.roomId);
    } catch {}

    return {
      id: room.id,
      user: {
        id: room.user.id,
        email: room.user.email,
        name: room.user.name,
        phoneNumber: room.user.phoneNumber,
        role: room.user.role,
        profilePicture: room.user.profilePicture ?? null,
      },
      lastMessageAt: room.lastMessageAt ?? null,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      messages: (room.messages || []).map(m => ({
        id: m.id,
        roomId: m.roomId,
        senderId: m.senderId,
        senderType: m.senderType,
        content: m.content ?? null,
        hasAttachments: m.hasAttachments,
        isReadByUser: m.isReadByUser,
        isReadByAdmin: m.isReadByAdmin,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        attachments: (m.attachments || []).map(att => ({
          id: att.id,
          url: att.url,
          mimeType: att.mimeType,
          type: att.type as AttachmentType,
          sizeBytes: att.sizeBytes,
          width: att.width ?? undefined,
          height: att.height ?? undefined,
          createdAt: att.createdAt,
          updatedAt: att.updatedAt,
        })),
      })),
    };
  }

  static async getRoomDetailByUserId(
    request: IGetChatRoomDetailByUserIdRequest,
  ): Promise<IGetChatRoomDetailResponse> {
    const validData = Validator.validate(
      ChatValidation.GET_ROOM_DETAIL_BY_USER,
      {
        userId: request.userId,
      },
    );

    if (
      request.currentUserRole !== Role.ADMIN &&
      request.currentUserId !== validData.userId
    ) {
      throw new ResponseError(StatusCodes.FORBIDDEN, 'Tidak memiliki akses');
    }

    let room = await ChatRoomRepository.findByUserIdWithMessages(
      validData.userId,
    );
    if (!room) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Ruang chat tidak ditemukan',
      );
    }

    let updatedMessages;
    try {
      if (request.currentUserRole === Role.ADMIN) {
        updatedMessages = await ChatMessageRepository.markReadByAdmin(room.id);
        if (updatedMessages.count > 0) {
          try {
            await IoService.emitChatMessage(
              room.id,
              room.userId,
              undefined,
              Role.ADMIN,
              true,
            );
          } catch {}
        }
      } else {
        updatedMessages = await ChatMessageRepository.markReadByUser(room.id);
        if (updatedMessages.count > 0) {
          try {
            await IoService.emitChatMessage(
              room.id,
              undefined,
              undefined,
              Role.USER,
              true,
            );
          } catch {}
        }
      }
      room = await ChatRoomRepository.findByIdWithMessages(room.id);
    } catch {}

    return {
      id: room.id,
      user: {
        id: room.user.id,
        email: room.user.email,
        name: room.user.name,
        phoneNumber: room.user.phoneNumber,
        role: room.user.role,
        profilePicture: room.user.profilePicture ?? null,
      },
      lastMessageAt: room.lastMessageAt ?? null,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      messages: (room.messages || []).map(m => ({
        id: m.id,
        roomId: m.roomId,
        senderId: m.senderId,
        senderType: m.senderType,
        content: m.content ?? null,
        hasAttachments: m.hasAttachments,
        isReadByUser: m.isReadByUser,
        isReadByAdmin: m.isReadByAdmin,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        attachments: (m.attachments || []).map(att => ({
          id: att.id,
          url: att.url,
          mimeType: att.mimeType,
          type: att.type as AttachmentType,
          sizeBytes: att.sizeBytes,
          width: att.width ?? undefined,
          height: att.height ?? undefined,
          createdAt: att.createdAt,
          updatedAt: att.updatedAt,
        })),
      })),
    };
  }

  static async deleteRoom(request: IDeleteChatRoomRequest): Promise<void> {
    const validData = Validator.validate(ChatValidation.DELETE_ROOM, request);

    const room = await ChatRoomRepository.findByIdWithMessages(
      validData.roomId,
    );
    if (!room) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Ruang chat tidak ditemukan',
      );
    }

    try {
      for (const msg of room.messages || []) {
        for (const att of msg.attachments || []) {
          if (att.url && fs.existsSync(att.url)) {
            try {
              fs.unlinkSync(att.url);
            } catch (e) {
              appLogger.error('Gagal menghapus file lampiran:', att.url, e);
            }
          }
        }
      }
    } catch (e) {
      appLogger.error('Gagal membersihkan file lampiran:', e);
    }

    await ChatRoomRepository.delete(room.id);
    IoService.emitChatMessage(
      room.id,
      room.userId,
      undefined,
      undefined,
      false,
    );
  }
}
