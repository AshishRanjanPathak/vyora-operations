import { Router } from 'express';
import productController from '../controllers/productController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  productQuerySchema,
  createProductSchema,
  updateProductSchema,
} from '../validators/productValidator.js';

const router = Router();

// All product routes require authentication
router.use(authenticate);

// View catalog is available to all authenticated internal staff
router.get('/', validate(productQuerySchema, 'query'), productController.getProducts);
router.get('/:id', productController.getProductById);

// Product creation and editing restricted to ADMIN and WAREHOUSE
router.post(
  '/',
  authorize(['ADMIN', 'WAREHOUSE']),
  validate(createProductSchema, 'body'),
  productController.createProduct
);

router.put(
  '/:id',
  authorize(['ADMIN', 'WAREHOUSE']),
  validate(updateProductSchema, 'body'),
  productController.updateProduct
);

// Delete product restricted to ADMIN only
router.delete('/:id', authorize(['ADMIN']), productController.deleteProduct);

export default router;