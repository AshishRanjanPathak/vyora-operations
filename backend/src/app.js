import './config/env.js';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import router from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// 1. Production Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'http://localhost:5000', 'https://*.onrender.com', 'https://*.vercel.app'],
        frameAncestors: ["'none'"],
      },
    },
    frameguard: { action: 'deny' }, // Anti-Clickjacking
    noSniff: true, // Anti-MIME sniffing
    xssFilter: true, // XSS filter
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// Disable X-Powered-By to prevent framework fingerprinting
app.disable('x-powered-by');

// 2. Strict CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, automated test suites)
      if (!origin) return callback(null, true);
      // Allow any official Vercel preview or production deploy
      if (
        origin.endsWith('.vercel.app') ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*')
      ) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Access denied for this origin.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 3. Rate Limiting Protection (Anti-Brute Force & Anti-DoS)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // Limit login attempts to 25 per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. For security reasons, please try again in 15 minutes.',
  },
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);

// 4. Request Payload Size Protection (Anti-Memory Exhaustion DoS)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// 5. Input Sanitization Middleware (XSS & Script Injection Stripping)
const sanitizeInput = (obj) => {
  if (typeof obj === 'string') {
    return obj
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/[<>]/g, '')
      .trim();
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeInput);
  }
  if (obj && typeof obj === 'object') {
    const clean = {};
    for (const [key, val] of Object.entries(obj)) {
      clean[key] = sanitizeInput(val);
    }
    return clean;
  }
  return obj;
};

app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeInput(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeInput(req.query);
  }
  next();
});

// 6. Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// 7. Root Health & Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mini ERP + CRM Enterprise API Service',
    status: 'ONLINE',
    version: '1.0.0',
    health: '/api/health',
  });
});

// 8. Mount API Router
app.use('/api', router);

// 9. 404 Catch-All Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource ${req.method} ${req.path} was not found on this server.`,
  });
});

// 10. Centralized Production Error Handler
app.use(errorHandler);

export default app;