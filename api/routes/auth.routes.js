// api/routes/auth.routes.js
import { Router } from 'express';
import {
  register, login, googleLogin, getMe,
  verifyUser, sendVerificationCode, confirmVerificationCode,
} from '../controllers/auth.controller.js';
import { authMiddleware }                                from '../middlewares/auth.middleware.js';
import { loginLimiter, googleLoginLimiter, registerLimiter } from '../middlewares/rateLimiter.middleware.js';
import rateLimit from 'express-rate-limit';

// Límite específico para el endpoint de envío de código:
// máx 3 envíos por 10 minutos por IP (evita spam de emails)
const sendCodeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({
    message: 'Demasiadas solicitudes de código. Espera unos minutos.',
  }),
});

const router = Router();

router.post('/register',       registerLimiter,    register);
router.post('/login',          loginLimiter,       login);
router.post('/google-login',   googleLoginLimiter, googleLogin);

// Verificación por email
router.post('/send-code',      authMiddleware, sendCodeLimiter, sendVerificationCode);
router.post('/confirm-code',   authMiddleware, confirmVerificationCode);

// Verificación biométrica (desde el perfil)
router.post('/verify',         authMiddleware, verifyUser);

router.get('/me',              authMiddleware, getMe);

export default router;