import { Hono } from 'hono';
import { CartController } from '../controllers';
import { authMiddleware } from '../middlewares';

export const cartRoute = new Hono();

cartRoute.get('/', authMiddleware, CartController.getCart);
cartRoute.patch('/clear', authMiddleware, CartController.clearCart);
