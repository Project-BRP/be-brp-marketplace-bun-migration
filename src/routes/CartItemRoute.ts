import { Hono } from 'hono';
import { CartItemController } from '../controllers';
import { authMiddleware } from '../middlewares';

export const cartItemRoute = new Hono();

cartItemRoute.post('/', authMiddleware, CartItemController.addToCart);
cartItemRoute.patch(
  '/:cartItemId',
  authMiddleware,
  CartItemController.updateCartItem,
);
cartItemRoute.delete(
  '/:cartItemId',
  authMiddleware,
  CartItemController.removeCartItem,
);
