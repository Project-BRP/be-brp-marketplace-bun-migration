import { ProductVariantController } from '../controllers';
import {
  authMiddleware,
  roleMiddleware,
  uploadMiddleware,
} from '../middlewares';
import { Role } from '../constants';
import { Hono } from 'hono';

export const productVariantRoute = new Hono();

productVariantRoute.post(
  '/products/:productId',
  authMiddleware,
  uploadMiddleware,
  roleMiddleware([Role.ADMIN]),
  ProductVariantController.createProductVariant,
);
productVariantRoute.patch(
  '/:id',
  authMiddleware,
  uploadMiddleware,
  roleMiddleware([Role.ADMIN]),
  ProductVariantController.updateProductVariant,
);
productVariantRoute.patch(
  '/:id/stock',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  ProductVariantController.editStock,
);
productVariantRoute.get('/:id', ProductVariantController.getProductVariantById);
productVariantRoute.get(
  '/products/:productId',
  ProductVariantController.getAllProductVariants,
);
productVariantRoute.delete(
  '/:id',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  ProductVariantController.deleteProductVariant,
);
