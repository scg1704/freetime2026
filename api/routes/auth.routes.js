// api/routes/auth.routes.js
import { Router } from 'express';
import { register, login, googleLogin, getMe } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register',     register);
router.post('/login',        login);
router.post('/google-login', googleLogin);
router.get('/me',            authMiddleware, getMe);

export default router;