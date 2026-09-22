const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const fs = require('fs');
const config = require('./config');
const { initDb, query: dbQuery } = require('./db');

// Import routes
const suitesRouter = require('./routes/suites');
const runsRouter = require('./routes/runs');
const statsRouter = require('./routes/stats');
const projectsRouter = require('./routes/projects');
const authRouter = require('./routes/auth');
const { authMiddleware, verifyToken } = require('./middleware/auth');
const scheduler = require('./services/scheduler');

const app = express();
const server = http.createServer(app);

// Socket.io initialization with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Ensure artifacts folder exists
if (!fs.existsSync(config.artifactsDir)) {
  fs.mkdirSync(config.artifactsDir, { recursive: true });
}
if (!fs.existsSync(config.runsStorageDir)) {
  fs.mkdirSync(config.runsStorageDir, { recursive: true });
}

// Serve static test artifacts (screenshots, videos, traces)
// Mount runsStorageDir under /artifacts/runs so URLs like /artifacts/runs/:runId/:file are served permanently
app.use('/artifacts/runs', express.static(config.runsStorageDir));
app.use('/artifacts', express.static(config.artifactsDir));

// API Routes with Cache-Control headers to prevent stale responses
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Public auth endpoints (login, register, etc.)
app.use('/api/auth', authRouter);

// Public health check endpoint
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbDetails = { host: 'localhost', port: 5432, database: 'qa_dashboard', activeConnections: 0 };
  try {
    const dbRes = await dbQuery('SELECT current_database() as db, inet_server_port() as port, count(*) as conns FROM pg_stat_activity WHERE datname = current_database() GROUP BY datname');
    if (dbRes && dbRes.rows.length > 0) {
      dbStatus = 'connected';
      dbDetails.database = dbRes.rows[0].db;
      dbDetails.port = dbRes.rows[0].port || 5432;
      dbDetails.activeConnections = parseInt(dbRes.rows[0].conns, 10) || 1;
    }
  } catch (err) {
    dbStatus = 'error';
    dbDetails.error = err.message;
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    database: {
      status: dbStatus,
      ...dbDetails,
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      playwrightVersion: '1.44.0',
    },
  });
});

// Protect all remaining /api routes with JWT authentication
app.use('/api', authMiddleware);

app.use('/api/projects', projectsRouter);
app.use('/api/suites', suitesRouter);
app.use('/api/runs', runsRouter);
app.use('/api/tests', runsRouter);
app.use('/api/stats', statsRouter);

// Serve built frontend static files if present
const frontendDist = require('path').resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/artifacts/') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(require('path').join(frontendDist, 'index.html'));
  });
}

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    return next(new Error('Authentication required for WebSocket connection'));
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    return next(new Error('Invalid or expired authentication token'));
  }
  socket.user = decoded;
  next();
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`[Socket.io] Authenticated client connected: ${socket.id} (${socket.user?.username || 'user'})`);

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Start Server with resilient port listening and background DB retry
function listenWithRetry(port, maxRetries = 10, delayMs = 1000) {
  let attempts = 0;

  function tryListen() {
    attempts++;

    const onError = (err) => {
      if (err.code === 'EADDRINUSE') {
        if (attempts <= maxRetries) {
          console.warn(`[Server] Port ${port} is temporarily busy. Retrying in ${delayMs}ms (attempt ${attempts}/${maxRetries})...`);
          setTimeout(tryListen, delayMs);
        } else {
          console.error(`[Server] Port ${port} is persistently in use. Exiting.`);
          process.exit(1);
        }
      } else {
        console.error('[Server] Fatal error on HTTP server:', err);
        process.exit(1);
      }
    };

    server.once('error', onError);

    server.listen(port, () => {
      server.removeListener('error', onError);
      console.log(`====================================================`);
      console.log(`[Server] QA Dashboard Backend running on http://localhost:${port}`);
      console.log(`[WebSocket] Ready for live streaming test logs`);
      console.log(`[Artifacts] Failure artifacts served at http://localhost:${port}/artifacts`);
      console.log(`[Database] Target PostgreSQL: ${config.databaseUrl.replace(/:[^:@]+@/, ':****@')}`);
      console.log(`====================================================`);
    });
  }

  tryListen();
}

async function connectDbWithRetry(retries = 0) {
  try {
    console.log('[PostgreSQL] Connecting and verifying database schema...');
    await initDb();
    // Clean up dangling runs from previous crashes or restarts
    await dbQuery("UPDATE test_runs SET status = 'failed', end_time = NOW() WHERE status = 'running'");
    await scheduler.initScheduler();
    console.log('[PostgreSQL] Database tables initialized and automated scheduler ready.');
  } catch (err) {
    const nextRetry = Math.min(3000 * Math.pow(1.2, retries), 10000);
    console.warn(`[PostgreSQL] Database not ready yet (${err.message}). Retrying in ${(nextRetry / 1000).toFixed(1)}s...`);
    setTimeout(() => connectDbWithRetry(retries + 1), nextRetry);
  }
}

async function startServer() {
  // 1. Immediately bind HTTP and WebSocket server so frontend proxy never encounters ECONNREFUSED
  listenWithRetry(config.port);

  // 2. Initialize PostgreSQL schema and automated scheduler in background with automatic retry
  connectDbWithRetry();
}

// Graceful termination handlers
process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

// Protect server from unexpected crashes
process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();
