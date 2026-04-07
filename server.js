import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Rutas
import authRoutes  from './api/routes/auth.routes.js';
import tasksRoutes from './api/routes/tasks.routes.js';
import usersRoutes from './api/routes/users.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 3001;

// ─────────────────────────────────────────────
// Middlewares globales
// ─────────────────────────────────────────────

// Aumentado a 2mb para soportar fotos de perfil en base64 comprimidas.
// Las imágenes se comprimen a ~400px JPEG antes de enviarse (~20-80 KB),
// pero el encoding base64 añade ~33% de overhead, de ahí el margen.
// Cuando se integre Cloudinary/S3, este límite podrá volver al default (100kb).
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ─────────────────────────────────────────────
// Rutas API
// ─────────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FreeTime API is running' });
});

// Matching algorithm (spec 3.3.2)
app.post('/api/match', (req, res) => {
  const { task, freetimer } = req.body;

  if (!task || !freetimer) {
    return res.status(400).json({ error: 'task and freetimer are required' });
  }

  const affinity =
    task.skills?.length > 0
      ? task.skills.filter((s) => freetimer.skills?.includes(s)).length / task.skills.length
      : 0;

  const rating    = (freetimer.rating ?? 0) / 5;
  const proximity = Math.max(0, 1 - (task.distance ?? 10) / 10);
  const score     = affinity * 0.5 + rating * 0.2 + proximity * 0.3;

  res.json({ score: parseFloat(score.toFixed(4)) });
});

// ─────────────────────────────────────────────
// Producción: servir build de Vite
// ─────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ─────────────────────────────────────────────
// Iniciar servidor
// ─────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FreeTime API corriendo en http://localhost:${PORT}`);
});