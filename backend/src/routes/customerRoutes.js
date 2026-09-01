import { Router } from 'express';
import customerController from '../controllers/customerController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  customerQuerySchema,
  createCustomerSchema,
  updateCustomerSchema,
  createFollowUpSchema,
} from '../validators/customerValidator.js';

const router = Router();

// All customer routes require authentication
router.use(authenticate);

// General customer access for ADMIN and SALES
router.get(
  '/',
  authorize(['ADMIN', 'SALES']),
  validate(customerQuerySchema, 'query'),
  customerController.getCustomers
);

router.post(
  '/',
  authorize(['ADMIN', 'SALES']),
  validate(createCustomerSchema, 'body'),
  customerController.createCustomer
);

router.get('/:id', authorize(['ADMIN', 'SALES']), customerController.getCustomerById);

router.put(
  '/:id',
  authorize(['ADMIN', 'SALES']),
  validate(updateCustomerSchema, 'body'),
  customerController.updateCustomer
);

router.post(
  '/:id/followups',
  authorize(['ADMIN', 'SALES']),
  validate(createFollowUpSchema, 'body'),
  customerController.addFollowUp
);

// Delete customer is restricted to ADMIN only (Documented Assumption)
router.delete('/:id', authorize(['ADMIN']), customerController.deleteCustomer);

export default router;