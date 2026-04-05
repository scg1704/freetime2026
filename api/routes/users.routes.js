import { Router } from 'express';
import { getUserById, updateUser } from '../controllers/users.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/me', authMiddleware, getUserById);
router.put('/me', authMiddleware, updateUser);

export default router;