import './config/env.js';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import router from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Security middleware
app.use(helmet());

// Dynamic CORS configuration for dev and deployed frontend domains
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      // Allow any Vercel deployment preview / production domain
      if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive fallback for assessment / portfolio demo
    },
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root health & welcome
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mini ERP + CRM API Service is running',
    version: '1.0.0',
    docs: '/api/health',
  });
});

// Mount modular API Routes
app.use('/api', router);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route ' + req.method + ' ' + req.path + ' not found',
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;