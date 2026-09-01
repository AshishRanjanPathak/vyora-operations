import { Router } from 'express';
import challanController from '../controllers/challanController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  challanQuerySchema,
  createChallanSchema,
} from '../validators/challanValidator.js';

const router = Router();

// All challan routes require authentication
router.use(authenticate);

// View challans is open to all authenticated staff (Sales, Warehouse, Accounts, Admin)
router.get('/', validate(challanQuerySchema, 'query'), challanController.getChallans);
router.get('/:id', challanController.getChallanById);

// Create draft challan: ADMIN and SALES
router.post(
  '/',
  authorize(['ADMIN', 'SALES']),
  validate(createChallanSchema, 'body'),
  challanController.createDraftChallan
);

// Confirm challan (reduces stock): ADMIN and WAREHOUSE
router.post('/:id/confirm', authorize(['ADMIN', 'WAREHOUSE']), challanController.confirmChallan);

// Cancel challan: ADMIN and WAREHOUSE
router.post('/:id/cancel', authorize(['ADMIN', 'WAREHOUSE']), challanController.cancelChallan);

export default router;