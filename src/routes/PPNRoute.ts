import { Hono } from 'hono';
import { PPNController } from '../controllers/PPNController';
import { authMiddleware, roleMiddleware } from '../middlewares';
import { Role } from '../constants';

export const ppnRoute = new Hono();

ppnRoute.get('/', authMiddleware, PPNController.getCurrentPPN);
ppnRoute.patch(
  '/',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  PPNController.updatePPN,
);
