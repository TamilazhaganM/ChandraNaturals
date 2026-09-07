import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { successResponse } from './utils/apiResponse.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Trust reverse proxy (for Render, Railway, Vercel, Nginx, etc.)
app.set('trust proxy', 1);

// 1. Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// 2. CORS Configuration
const getParsedAllowedOrigins = () => {
  const configured = (process.env.FRONTEND_URL || '')
    .split(',')
    .map(url => url.trim().replace(/\/$/, ''))
    .filter(Boolean);

  const defaults = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
  ];

  return Array.from(new Set([...configured, ...defaults]));
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server, health probes)
      if (!origin) return callback(null, true);

      const origins = getParsedAllowedOrigins();
      const isAllowed =
        origins.includes(origin) ||
        (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:')) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.netlify.app') ||
        origin.includes('chandranaturals');

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(new Error(`Origin '${origin}' not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Razorpay-Signature']
  })
);

// 3. Request Body Parsers (with raw body buffer capture for Razorpay webhook verification)
app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Cookie Parser
app.use(cookieParser());

// 5. HTTP Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// 6. Global API Rate Limiting
app.use('/api/', apiLimiter);

// 7. System Health Check Endpoints
app.get('/health', (req, res) => {
  return successResponse(res, {
    message: 'Chandra Naturals Backend API is healthy and operational 🌿',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

app.get('/api/health', (req, res) => {
  return successResponse(res, {
    message: 'Chandra Naturals Backend API is healthy and operational 🌿',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// 8. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', (req, res, next) => {
  // Convenience alias for /api/products/categories
  req.url = '/categories';
  productRoutes(req, res, next);
});
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);

// 9. 404 & Global Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
