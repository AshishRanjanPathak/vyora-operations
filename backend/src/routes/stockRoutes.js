import { Router } from 'express';
import stockController from '../controllers/stockController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  stockMovementQuerySchema,
  createStockMovementSchema,
} from '../validators/stockValidator.js';

const router = Router();

// All stock movement routes require authentication
router.use(authenticate);

// View movement ledger is available to all authenticated internal staff (Admin, Warehouse, Accounts, Sales)
router.get(
  '/movements',
  validate(stockMovementQuerySchema, 'query'),
  stockController.getMovements
);

// Recording manual movements is restricted to ADMIN and WAREHOUSE
router.post(
  '/movements',
  authorize(['ADMIN', 'WAREHOUSE']),
  validate(createStockMovementSchema, 'body'),
  stockController.recordMovement
);

export default router;