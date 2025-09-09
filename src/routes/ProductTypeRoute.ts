import { Hono } from 'hono';
import { ProductTypeController } from '../controllers';
import { authMiddleware, roleMiddleware } from '../middlewares';
import { Role } from '../constants';

export const productTypeRoute = new Hono();

productTypeRoute.post(
  '/',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  ProductTypeController.createProductType,
);
productTypeRoute.patch(
  '/:id',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  ProductTypeController.updateProductType,
);
productTypeRoute.get('/:id', ProductTypeController.getProductTypeById);
productTypeRoute.get('/', ProductTypeController.getAllProductTypes);
productTypeRoute.delete(
  '/:id',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  ProductTypeController.deleteProductType,
);
