import { Router } from 'express';
import authController from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { loginSchema } from '../validators/authValidator.js';

const router = Router();

// Public route: Log in with credentials
router.post('/login', validate(loginSchema), authController.login);

// Protected route: Get authenticated user profile
router.get('/me', authenticate, authController.getMe);

export default router;