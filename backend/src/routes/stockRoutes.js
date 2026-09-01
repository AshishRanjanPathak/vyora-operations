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

// All stock movement routes require authentication and are restricted to ADMIN and WAREHOUSE
router.use(authenticate);
router.use(authorize(['ADMIN', 'WAREHOUSE']));

router.get(
  '/movements',
  validate(stockMovementQuerySchema, 'query'),
  stockController.getMovements
);

router.post(
  '/movements',
  validate(createStockMovementSchema, 'body'),
  stockController.recordMovement
);

export default router;