import { Hono } from 'hono';
import { ChatController } from '../controllers/ChatController';
import { authMiddleware } from '../middlewares';
import { roleMiddleware } from '../middlewares';
import { Role } from '../constants';
import { uploadArraysMiddleware } from '../middlewares';

export const chatRoute = new Hono();

chatRoute.get(
  '/presence/admin',
  authMiddleware,
  ChatController.getAdminPresence,
);
chatRoute.get(
  '/unread/total',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  ChatController.getAdminUnreadTotal,
);
chatRoute.get(
  '/unread/user/total',
  authMiddleware,
  roleMiddleware([Role.USER]),
  ChatController.getUserUnreadTotal,
);
chatRoute.get(
  '/presence/user/:userId',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  ChatController.getUserPresence,
);
chatRoute.get(
  '/presence/users',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  ChatController.getOnlineUsers,
);
chatRoute.get(
  '/rooms',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  ChatController.getAllRooms,
);
chatRoute.get(
  '/rooms/user',
  authMiddleware,
  ChatController.getRoomDetailByUserId,
);
chatRoute.get('/rooms/:roomId', authMiddleware, ChatController.getRoomDetail);
chatRoute.delete(
  '/rooms/:roomId',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  ChatController.deleteRoom,
);
chatRoute.post(
  '/messages',
  authMiddleware,
  uploadArraysMiddleware('attachments', 5),
  ChatController.createMessage,
);
