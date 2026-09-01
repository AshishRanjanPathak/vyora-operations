import { Router } from 'express';
import dashboardController from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// Dashboard is accessible to all authenticated staff
router.use(authenticate);

router.get('/stats', dashboardController.getStats);

export default router;