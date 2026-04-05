import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  getMyTasks,
  createTask,
  getApplicants,
  acceptApplicant,
} from '../controllers/tasks.controller.js';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getTasks);
router.get('/my-tasks', authMiddleware, getMyTasks);
router.get('/:taskId', getTaskById);
router.post('/', authMiddleware, requireRole('FULLTIMER'), createTask);
router.get('/:taskId/applicants', authMiddleware, requireRole('FULLTIMER'), getApplicants);
router.post('/:taskId/accept', authMiddleware, requireRole('FULLTIMER'), acceptApplicant);

export default router;