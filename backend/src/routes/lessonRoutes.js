import { Router } from 'express';
import { createLesson } from '../controllers/lessonController.js';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', requireAuth, requireAdmin, createLesson);

export default router;
