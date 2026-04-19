// api/middlewares/rateLimiter.middleware.js
//
// Protección anti-DDoS / fuerza bruta para las rutas de autenticación.
//
// INSTALACIÓN (una sola vez):
//   npm install express-rate-limit
//
// Usa un store en memoria (Map). Si en el futuro pasas a múltiples
// instancias del servidor, reemplaza el store por uno de Redis:
//   npm install rate-limit-redis
//   import { RedisStore } from 'rate-limit-redis';

import rateLimit from 'express-rate-limit';

// ─────────────────────────────────────────────
// Helpers para respuesta estandarizada
// ─────────────────────────────────────────────
function tooManyRequestsHandler(req, res) {
  res.status(429).json({
    message: 'Demasiados intentos. Por favor espera un momento antes de intentar de nuevo.',
    retryAfter: res.getHeader('Retry-After'),
  });
}

// ─────────────────────────────────────────────
// 1. Login — protección contra fuerza bruta
//    Máximo 10 intentos cada 15 minutos por IP.
//    Los atacantes necesitarían 15 min entre cada
//    ráfaga de 10 intentos → inviable para brute-force.
// ─────────────────────────────────────────────
export const loginLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,  // 15 minutos
  max:              10,               // max requests por ventana
  standardHeaders:  true,            // Envía headers Retry-After estándar (RateLimit-*)
  legacyHeaders:    false,
  handler:          tooManyRequestsHandler,
  // Identificar por IP (comportamiento por defecto de express-rate-limit)
  keyGenerator:     (req) => req.ip,
  // Saltear si la request ya falló antes de llegar al controlador
  // (ej. JSON malformado), para no penalizar errores de cliente legítimos
  skip:             (req, res) => res.statusCode === 400,
});

// ─────────────────────────────────────────────
// 2. Google Login — mismo límite que login manual
// ─────────────────────────────────────────────
export const googleLoginLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              10,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler:          tooManyRequestsHandler,
  keyGenerator:     (req) => req.ip,
});

// ─────────────────────────────────────────────
// 3. Registro — más permisivo (crear cuentas no es
//    tan peligroso como fuerza bruta en login, pero
//    prevenimos spam masivo de cuentas).
//    Máximo 5 registros por hora por IP.
// ─────────────────────────────────────────────
export const registerLimiter = rateLimit({
  windowMs:         60 * 60 * 1000,  // 1 hora
  max:              5,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler:          (req, res) => {
    res.status(429).json({
      message: 'Has creado demasiadas cuentas desde esta red. Intenta de nuevo más tarde.',
      retryAfter: res.getHeader('Retry-After'),
    });
  },
  keyGenerator: (req) => req.ip,
});

// ─────────────────────────────────────────────
// 4. Límite global de API (safety net general)
//    Máximo 200 requests por 10 minutos por IP.
//    Cubre todas las rutas /api/* para prevenir
//    ataques de scraping o flood genérico.
// ─────────────────────────────────────────────
export const globalApiLimiter = rateLimit({
  windowMs:         10 * 60 * 1000,  // 10 minutos
  max:              200,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler:          (req, res) => {
    res.status(429).json({
      message: 'Demasiadas solicitudes. Por favor espera unos minutos.',
      retryAfter: res.getHeader('Retry-After'),
    });
  },
  keyGenerator: (req) => req.ip,
});