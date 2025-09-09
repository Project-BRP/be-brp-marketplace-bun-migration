import { Hono } from 'hono';
import { ProductController } from '../controllers';
import {
  authMiddleware,
  roleMiddleware,
  uploadMiddleware,
} from '../middlewares';
import { Role } from '../constants';

export const productRoute = new Hono();

productRoute.post(
  '/',
  authMiddleware,
  uploadMiddleware,
  roleMiddleware([Role.ADMIN]),
  ProductController.createProduct,
);
productRoute.patch(
  '/:id',
  authMiddleware,
  uploadMiddleware,
  roleMiddleware([Role.ADMIN]),
  ProductController.updateProduct,
);
productRoute.get('/:id', ProductController.getProductById);
productRoute.get('/', ProductController.getAllProducts);
productRoute.delete(
  '/:id',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  ProductController.deleteProduct,
);
