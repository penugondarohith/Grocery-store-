import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { logger } from './config/logger';
import { generalLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

import authRoutes from './routes/auth.routes';
import { productRouter, categoryRouter, orderRouter, paymentRouter } from './routes/routes';

const app: Application = express();

// ----------------------------------------------------------------
// Security & compression
// ----------------------------------------------------------------
app.use(helmet());
app.use(compression());

// ----------------------------------------------------------------
// CORS
// ----------------------------------------------------------------
const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ----------------------------------------------------------------
// Body parsing
// ----------------------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ----------------------------------------------------------------
// HTTP request logging
// ----------------------------------------------------------------
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
    skip: (req) => req.url === '/health',
  })
);

// ----------------------------------------------------------------
// Global rate limiter
// ----------------------------------------------------------------
app.use(generalLimiter);

// ----------------------------------------------------------------
// API Routes
// ----------------------------------------------------------------
const API = `/api/${env.API_VERSION}`;

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/products`, productRouter);
app.use(`${API}/categories`, categoryRouter);
app.use(`${API}/orders`, orderRouter);
app.use(`${API}/payments`, paymentRouter);

// ----------------------------------------------------------------
// Swagger docs
// ----------------------------------------------------------------
app.use(
  `${API}/docs`,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Vijaya Lakshmi General Stores API Docs',
    customCss: '.swagger-ui .topbar { background-color: #16a34a; }',
  })
);

// ----------------------------------------------------------------
// Health check
// ----------------------------------------------------------------
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    version: env.API_VERSION,
  });
});

// ----------------------------------------------------------------
// 404 & Error handlers
// ----------------------------------------------------------------
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
