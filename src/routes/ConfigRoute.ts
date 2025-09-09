import { Hono } from 'hono';
import { ConfigController } from '../controllers';
import { uploadMiddleware } from '../middlewares';

export const configRoute = new Hono();

configRoute.post('/logo', uploadMiddleware, ConfigController.uploadLogo);
configRoute.get('/logo', ConfigController.getLogo);
