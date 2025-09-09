import './configs/env';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { Server as IOServer } from 'socket.io';
import { Server as Engine } from '@socket.io/bun-engine';

import { appLogger } from './configs/logger';
import { currentEnv, Env, CLIENT_URL } from './constants';
import { errorMiddleware } from './middlewares/error-middleware';
import { staticUploadsHandler } from './middlewares/static-upload';
import { registerSocketHandlers } from './sockets/register-socket';
import { socketAuthMiddleware } from './middlewares/socket-auth-middleware';
import {
  healthRoute,
  authRoute,
  productRoute,
  productVariantRoute,
  configRoute,
  cartRoute,
  cartItemRoute,
  ppnRoute,
  transactionRoute,
  shippingRoute,
  companyInfoRoute,
  reportRoute,
  chatRoute,
} from './routes';

// === App Hono ===
const app = new Hono();

// CORS
app.use(
  '*',
  cors({
    origin: origin => {
      if (!origin) return origin;
      const allow =
        currentEnv === Env.PRODUCTION
          ? [CLIENT_URL.PRODUCTION]
          : [CLIENT_URL.DEVELOPMENT, CLIENT_URL.LOCAL];
      if (allow.includes(origin)) return origin;
      return currentEnv === Env.PRODUCTION
        ? CLIENT_URL.PRODUCTION
        : CLIENT_URL.DEVELOPMENT;
    },
    credentials: true,
  }),
);

app.use('*', logger());
app.use('*', secureHeaders());
app.onError(errorMiddleware);

// Static uploads
app.get('/uploads/*', staticUploadsHandler);

// Routes
app.route('/api', healthRoute);
app.route('/api/auth', authRoute);
app.route('/api/products', productRoute);
app.route('/api/product-variants', productVariantRoute);
app.route('/api/config', configRoute);
app.route('/api/carts', cartRoute);
app.route('/api/cart-items', cartItemRoute);
app.route('/api/ppn', ppnRoute);
app.route('/api/transactions', transactionRoute);
app.route('/api/shipping', shippingRoute);
app.route('/api/company-info', companyInfoRoute);
app.route('/api/reports', reportRoute);
app.route('/api/chats', chatRoute);

// === Socket.IO + Bun Engine ===
export const io = new IOServer({
  cors: {
    origin:
      currentEnv === Env.PRODUCTION
        ? CLIENT_URL.PRODUCTION
        : [CLIENT_URL.DEVELOPMENT, CLIENT_URL.LOCAL],
    credentials: true,
  },
});

const engine = new Engine({
  path: '/socket.io/',
});

io.bind(engine);
io.use(socketAuthMiddleware);
registerSocketHandlers(io);

// Ambil websocket handler dari engine
const { websocket } = engine.handler();

// === Bun.serve ===
const port = Number(process.env.PORT_SERVER) || 5000;
Bun.serve({
  port,
  idleTimeout: 30, // harus lebih besar dari pingInterval (25s)
  fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname.startsWith('/socket.io/')) {
      return engine.handleRequest(req, server);
    }

    return app.fetch(req, server);
  },
  websocket,
});

appLogger.info(`🚀 Server is running on port ${port}`);
