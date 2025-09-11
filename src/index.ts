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
  productTypeRoute,
  packagingRoute,
} from './routes';

// === App Hono ===
const app = new Hono();

let origin: string[] = [];

if (currentEnv === Env.DEVELOPMENT) {
  origin = [CLIENT_URL.DEVELOPMENT, CLIENT_URL.LOCAL];
} else if (currentEnv === Env.PRODUCTION) {
  origin = [CLIENT_URL.PRODUCTION];
} else if (currentEnv === Env.TESTING) {
  origin = [CLIENT_URL.LOCAL];
} else {
  appLogger.error('Invalid environment');
  process.exit(1);
}

// CORS
app.use(
  '*',
  cors({
    origin: origin,
    credentials: true,
  }),
);

app.use('*', logger());
app.use('*', secureHeaders());
app.onError(errorMiddleware);

// Static uploads
app.get('/uploads/*', staticUploadsHandler);

// Routes
app.route('/api/', healthRoute);
app.route('/api/config', configRoute);
app.route('/api/auth', authRoute);
app.route('/api/product-types', productTypeRoute);
app.route('/api/products', productRoute);
app.route('/api/packagings', packagingRoute);
app.route('/api/product-variants', productVariantRoute);
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
    origin: origin,
    credentials: true,
  },
});

const engine = new Engine({
  path: '/socket.io',
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

    if (url.pathname === '/socket.io' || url.pathname.startsWith('/socket.io/')) {
      return engine.handleRequest(req, server);
    }

    return app.fetch(req, server);
  },
  websocket,
});

appLogger.info(`🚀 Server is running on port ${port}`);
