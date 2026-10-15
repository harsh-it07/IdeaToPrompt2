import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ── Import DB initializer ──────────────────────────────────────
import { initDB } from './config/database.js';

// ── Import Routes ──────────────────────────────────────────────
import authRoutes from './routes/auth.routes.js';
import promptRoutes from './routes/prompt.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ── Global Middleware ──────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,        // Allow inline styles/scripts in HTML
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

// ── Serve Frontend (static files from client/) ─────────────────
app.use(express.static(join(__dirname, '..', 'client')));

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/prompts', promptRoutes);

// ── Health Check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ── Catch-all: serve index.html for SPA routing ────────────────
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '..', 'client', 'index.html'));
});

// ── Global Error Handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Initialize DB, then Start Server ───────────────────────────
async function start() {
  try {
    await initDB();

    app.listen(PORT, () => {
      console.log(`
  ╔══════════════════════════════════════════════════╗
  ║                                                  ║
  ║   🚀  IdeaToPrompt Server                       ║
  ║                                                  ║
  ║   Local:   http://localhost:${PORT}                ║
  ║   Status:  Running ✓                             ║
  ║   Mode:    ${(process.env.NODE_ENV || 'development').padEnd(25)}║
  ║                                                  ║
  ╚══════════════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

export default app;
