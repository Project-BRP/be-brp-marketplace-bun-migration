import { Hono } from 'hono';
import { PackagingController } from '../controllers';
import { authMiddleware, roleMiddleware } from '../middlewares';
import { Role } from '../constants';

export const packagingRoute = new Hono();

packagingRoute.post(
  '/',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  PackagingController.createPackaging,
);
packagingRoute.patch(
  '/:id',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  PackagingController.updatePackaging,
);
packagingRoute.get('/:id', PackagingController.getPackagingById);
packagingRoute.get('/', PackagingController.getAllPackagings);
packagingRoute.delete(
  '/:id',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  PackagingController.deletePackaging,
);
