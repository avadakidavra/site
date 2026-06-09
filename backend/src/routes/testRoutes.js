import { Router } from 'express';
import { createTest, submitTest } from '../controllers/testController.js';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', requireAuth, requireAdmin, createTest);
router.post('/:id/submit', requireAuth, submitTest);

export default router;
