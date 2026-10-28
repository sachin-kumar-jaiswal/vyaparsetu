import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';

import authRoutes from './modules/auth/authRoutes.js';
import sellerRoutes from './modules/sellers/sellerRoutes.js';
import addressRoutes from './modules/addresses/addressRoutes.js';
import categoryRoutes from './modules/categories/categoryRoutes.js';
import productRoutes from './modules/products/productRoutes.js';
import orderRoutes from './modules/orders/orderRoutes.js';
import bulkRequestRoutes from './modules/bulk-requests/bulkRequestRoutes.js';
import adminRoutes from './modules/admin/adminRoutes.js';

import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('CORS policy: Origin not allowed'));
      }
    },
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? 'ok' : 'unavailable',
    service: 'VyaparSetu Backend API',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStatusMap[dbState] || 'unknown',
  });
});

// Feature API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/sellers', sellerRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/bulk-requests', bulkRequestRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' was not found on this server.`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
