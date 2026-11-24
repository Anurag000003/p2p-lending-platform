const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

dotenv.config();

const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);

// 1. Security Headers via Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// 2. HTTP Response Gzip Compression
app.use(compression());

// 3. Robust CORS Configuration
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
};
app.use(cors(corsOptions));

// 4. Rate Limiting for API Endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit sensitive auth & KYC operations
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again in 15 minutes.' }
});

// Socket.io for live funding progress & real-time updates
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Attach io to req for controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check endpoint (for AWS/GCP/Kubernetes ALB & readiness probes)
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isHealthy = dbState === 1;
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    service: 'P2P Lending, Borrowing & Group Funding Platform API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: isHealthy ? 'connected' : 'disconnected',
      code: dbState
    },
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Apply rate limiters
app.use('/api/auth/', authLimiter);
app.use('/api/verify/', authLimiter);
app.use('/api/', apiLimiter);

// API Routes
app.use('/api', apiRoutes);

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// Global Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[API Error]:', err);
  const status = err.status || (err.name === 'ValidationError' ? 400 : 500);
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Socket connection
io.on('connection', (socket) => {
  socket.on('join_campaign', (campaignId) => {
    socket.join(`campaign_${campaignId}`);
  });
  socket.on('join_loan', (loanId) => {
    socket.join(`loan_${loanId}`);
  });
});

const PORT = process.env.PORT || 5050;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/p2p_lending_platform';

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(MONGODB_URI, {
    maxPoolSize: 50,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  })
    .then(() => {
      console.log(`[MongoDB] Connected successfully to ${MONGODB_URI}`);
      server.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(` P2P Lending, Borrowing & Group Funding API is Live`);
        console.log(` Server URL : http://localhost:${PORT}`);
        console.log(` Health URL : http://localhost:${PORT}/health`);
        console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(` Security   : Helmet, Compression & Rate Limit Active`);
        console.log(`=======================================================`);
      });
    })
    .catch((err) => {
      console.error('[MongoDB] Connection error:', err.message);
      process.exit(1);
    });
}

// Graceful Shutdown handling for Docker / Kubernetes / PM2
const handleGracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await mongoose.connection.close(false);
      console.log('MongoDB connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
      process.exit(1);
    }
  });

  // Force close after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

module.exports = { app, server };
