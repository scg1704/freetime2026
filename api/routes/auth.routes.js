// api/routes/auth.routes.js
// api/routes/auth.routes.js

import { Router } from 'express';
import { register, login, googleLogin, getMe } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  loginLimiter,
  googleLoginLimiter,
  registerLimiter,
} from '../middlewares/rateLimiter.middleware.js';

const router = Router();

// Rate limiters aplicados individualmente por ruta
// para ajustar la política a la sensibilidad de cada endpoint.
router.post('/register',     registerLimiter,     register);
router.post('/login',        loginLimiter,        login);
router.post('/google-login', googleLoginLimiter,  googleLogin);
router.get('/me',            authMiddleware,      getMe);

export default router;