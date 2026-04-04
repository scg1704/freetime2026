import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'FreeTime API is running' });
  });

  // Matching algorithm (spec 3.3.2)
  // Score = (Afinidad_Perfil * 0.50) + (Calificación_Promedio * 0.20) + (Proximidad_Geográfica * 0.30)
  app.post('/api/match', (req, res) => {
    const { task, freetimer } = req.body;

    if (!task || !freetimer) {
      return res.status(400).json({ error: 'task and freetimer are required' });
    }

    const affinity =
      task.skills && task.skills.length > 0
        ? task.skills.filter((s) => freetimer.skills?.includes(s)).length /
          task.skills.length
        : 0;

    const rating = (freetimer.rating ?? 0) / 5;
    const proximity = Math.max(0, 1 - (task.distance ?? 10) / 10);

    const score = affinity * 0.5 + rating * 0.2 + proximity * 0.3;

    res.json({ score: parseFloat(score.toFixed(4)) });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();