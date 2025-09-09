import { Role, ChatSenderType } from '@prisma/client';
import { AttachmentType } from '../constants';

export enum MsgSender {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface ICreateChatMessageRequest {
  currentUserId: string;
  currentUserRole: Role;
  userId?: string;
  content?: string | null;
  attachments?: {
    url: string;
    mimeType: string;
    sizeBytes: number;
    type: AttachmentType;
    width?: number | null;
    height?: number | null;
  }[];
}

export interface IChatAttachmentDTO {
  id: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  type: AttachmentType;
  width?: number | null;
  height?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatMessageDTO {
  id: string;
  roomId: string;
  senderId: string;
  senderType: ChatSenderType;
  content?: string | null;
  hasAttachments: boolean;
  isReadByUser: boolean;
  isReadByAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  attachments: IChatAttachmentDTO[];
}

export interface ICreateChatMessageResponse {
  roomId: string;
  message: IChatMessageDTO;
}

export interface IGetAllChatRoomsRequest {
  search?: string | null;
  page?: number | null;
  limit?: number | null;
}

export interface IChatRoomUserDTO {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  role: Role;
  profilePicture?: string | null;
}

export interface IGetChatRoomResponse {
  id: string;
  user: IChatRoomUserDTO;
  lastMessageAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  totalUnreadMessages: number;
}

export interface IGetAllChatRoomsResponse {
  totalPage: number;
  currentPage: number;
  rooms: IGetChatRoomResponse[];
}

export interface IGetChatRoomDetailRequest {
  currentUserId: string;
  currentUserRole: Role;
  roomId: string;
}

export interface IGetChatRoomDetailResponse {
  id: string;
  user: IChatRoomUserDTO;
  lastMessageAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  messages: IChatMessageDTO[];
}

export interface IDeleteChatRoomRequest {
  roomId: string;
}

export interface IGetChatRoomDetailByUserIdRequest {
  currentUserId: string;
  currentUserRole: Role;
  userId: string;
}

export interface IGetTotalUnreadMessagesAdminResponse {
  totalUnreadMessages: number;
}

export interface IGetTotalUnreadMessagesUserResponse {
  totalUnreadMessages: number;
}
