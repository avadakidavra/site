import { Router } from 'express';
import { createCourse, getCourseById, getCourses } from '../controllers/courseController.js';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getCourses);
router.post('/', requireAuth, requireAdmin, createCourse);
router.get('/:id', getCourseById);

export default router;
