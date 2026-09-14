import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import moviesRouter from './routes/movies.js';
import tvRouter from './routes/tv.js';
import debugRouter from './routes/debug.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Configure CORS for production and development
const configuredOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.ADDITIONAL_ALLOWED_ORIGINS ? process.env.ADDITIONAL_ALLOWED_ORIGINS.split(',') : [])
].filter(Boolean).map(o => o.trim().replace(/\/$/, ''));

const devOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. same-origin Nginx proxy, curl, mobile, health checks)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, '');

    // Allow explicitly configured frontend origins (e.g. FRONTEND_URL=http://YOUR_EC2_IP)
    if (configuredOrigins.length > 0 && configuredOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // In development or if FRONTEND_URL is unset, allow dev origins
    if (NODE_ENV !== 'production' || configuredOrigins.length === 0) {
      if (devOrigins.includes(normalizedOrigin) || configuredOrigins.length === 0) {
        return callback(null, true);
      }
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS policy`));
  },
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Request logging (sanitized, never prints API keys or secrets)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (NODE_ENV !== 'production' || res.statusCode >= 400) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint (for AWS ALB/EC2 healthchecks)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'JazzHub API',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/movies', moviesRouter);
app.use('/api/tv', tvRouter);
app.use('/api/debug', debugRouter);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handling middleware (sanitized in production)
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.message || err);
  const isProd = NODE_ENV === 'production';
  res.status(err.status || 500).json({
    success: false,
    error: err.status === 404 ? 'Not Found' : 'Internal Server Error',
    message: isProd && (!err.status || err.status >= 500)
      ? 'An unexpected error occurred.'
      : (err.message || 'An unexpected error occurred.')
  });
});

// Start Express server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`  🎺 JazzHub Express Server Active`);
  console.log(`  Environment: ${NODE_ENV}`);
  console.log(`  Listening on: http://0.0.0.0:${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});

// Graceful shutdown handlers for PM2 / container lifecycle
const shutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
