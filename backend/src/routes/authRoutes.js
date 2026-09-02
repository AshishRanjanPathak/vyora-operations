import { Router } from 'express';
import authController from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
} from '../validators/authValidator.js';

const router = Router();

// Public routes: Login & Register
router.post('/login', validate(loginSchema), authController.login);
router.post('/register', validate(registerSchema), authController.register);

// Protected routes: Authenticated User Operations
router.get('/me', authenticate, authController.getMe);
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

export default router;