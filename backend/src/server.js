// FeastFlow Backend — Express.js REST API
const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const helmet     = require('helmet');

const restaurantsRouter = require('./routes/restaurants');
const ordersRouter      = require('./routes/orders');
const menuRouter        = require('./routes/menu');
const authRouter        = require('./routes/auth');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:8080' }));
app.use(express.json());
app.use(morgan('combined'));

// ── Health check (used by Jenkins smoke tests) ───────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status:    'ok',
    service:   'feastflow-backend',
    version:   process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    uptime:    process.uptime(),
  });
});

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',        authRouter);
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/menu',        menuRouter);
app.use('/api/orders',      ordersRouter);

// ── 404 handler ───────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global error handler ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🍕 FeastFlow API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
