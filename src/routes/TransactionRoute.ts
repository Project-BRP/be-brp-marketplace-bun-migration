import { TransactionController } from '../controllers';
import { authMiddleware, roleMiddleware } from '../middlewares';
import { Role } from '../constants';
import { Hono } from 'hono';

export const transactionRoute = new Hono();

transactionRoute.post(
  '/',
  authMiddleware,
  TransactionController.createTransaction,
);
transactionRoute.get(
  '/user/:userId',
  authMiddleware,
  TransactionController.getByUserId,
);
transactionRoute.get(
  '/status-list',
  authMiddleware,
  TransactionController.getTxStatusList,
);
transactionRoute.get(
  '/method-list',
  authMiddleware,
  TransactionController.getTxMethodList,
);
transactionRoute.get(
  '/date-range',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  TransactionController.getTransactionDateRanges,
);
transactionRoute.get(
  '/',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  TransactionController.getAll,
);
transactionRoute.post('/notification', TransactionController.transactionNotif);
transactionRoute.get('/:id', authMiddleware, TransactionController.getById);
transactionRoute.post(
  '/:id/request-payment',
  authMiddleware,
  TransactionController.requestPayment,
);
transactionRoute.patch(
  '/:id',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  TransactionController.updateTransactionStatus,
);
transactionRoute.post(
  '/:id/add-manual-shipping-cost',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  TransactionController.addManualShippingCost,
);
transactionRoute.patch(
  '/:id/shipping-receipt',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  TransactionController.updateShippingReceipt,
);
transactionRoute.post(
  '/:id/cancel',
  authMiddleware,
  TransactionController.cancelTransaction,
);

transactionRoute.patch(
  '/items/:transactionItemId/resolve-stock-issue',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  TransactionController.resolveStockIssue,
);
