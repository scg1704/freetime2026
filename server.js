// server.js
import express        from 'express';
import path           from 'path';
import { fileURLToPath } from 'url';
import dotenv         from 'dotenv';
import authRoutes     from './api/routes/auth.routes.js';
import tasksRoutes    from './api/routes/tasks.routes.js';
import usersRoutes    from './api/routes/users.routes.js';
import { globalApiLimiter } from './api/middlewares/rateLimiter.middleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const app        = express();
const PORT       = process.env.PORT || 3001;

// ─────────────────────────────────────────────────────────────────────────────
// Proxy trust
// Necesario para que express-rate-limit lea el IP real cuando el servidor
// esté detrás de un proxy (Nginx, Heroku, Railway, etc.).
// En desarrollo local no afecta nada.
// ─────────────────────────────────────────────────────────────────────────────
app.set('trust proxy', 1);

// ─────────────────────────────────────────────────────────────────────────────
// FIX BUG 1 — Cross-Origin-Opener-Policy para Google OAuth popup
//
// El error "COOP policy would block the window.closed call" ocurre porque
// Express sirve por defecto el header:
//   Cross-Origin-Opener-Policy: same-origin
// Ese valor aísla el contexto de navegación y hace que el popup de Google
// no pueda comunicarse de vuelta con la ventana padre.
//
// La solución es usar "same-origin-allow-popups": permite que popups abiertos
// desde este origen (el popup de cuentas de Google) mantengan referencia al
// opener, que es exactamente lo que necesita el flujo OAuth de Firebase/Google.
// ─────────────────────────────────────────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// Middlewares globales
// ─────────────────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Rate limit global — cubre TODAS las rutas /api/*
// como red de seguridad ante floods genéricos.
app.use('/api', globalApiLimiter);

// ─────────────────────────────────────────────────────────────────────────────
// API Routes
// (Los limiters específicos de auth están en auth.routes.js)
// ─────────────────────────────────────────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/users', usersRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'FreeTime API is running' });
});

// Matching algorithm (spec 3.3.2)
app.post('/api/match', (req, res) => {
  const { task, freetimer } = req.body;

  if (!task || !freetimer) {
    return res.status(400).json({ error: 'task and freetimer are required' });
  }

  const affinity  = task.skills?.length > 0
    ? task.skills.filter((s) => freetimer.skills?.includes(s)).length / task.skills.length
    : 0;
  const rating    = (freetimer.rating ?? 0) / 5;
  const proximity = Math.max(0, 1 - (task.distance ?? 10) / 10);
  const score     = affinity * 0.5 + rating * 0.2 + proximity * 0.3;

  res.json({ score: parseFloat(score.toFixed(4)) });
});

// ─────────────────────────────────────────────────────────────────────────────
// Production: serve Vite build
// ─────────────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FreeTime API corriendo en http://localhost:${PORT}`);
});