import { Router } from 'express';
import authRoutes from './authRoutes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ERP CRM API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Mount feature routes
router.use('/auth', authRoutes);

export default router;