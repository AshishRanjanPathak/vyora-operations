import './config/env.js';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import router from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
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

// Routes
app.use('/api', router);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route ' + req.method + ' ' + req.path + ' not found',
  });
});

// Central error handler (must be last)
app.use(errorHandler);

export default app;
