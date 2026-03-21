/**
 * Main Server Entry Point
 * Sets up Express, connects to MongoDB, mounts all routes,
 * and initializes the Socket.IO server for real-time features.
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import all route files
const authRoutes = require('./routes/auth');
const hospitalRoutes = require('./routes/hospital');
const patientRoutes = require('./routes/patient');
const appointmentRoutes = require('./routes/appointment');
const emergencyRoutes = require('./routes/emergency');
const medicalRoutes = require('./routes/medical');
const healthRoutes = require('./routes/health');
const adminRoutes = require('./routes/admin');

// Import Socket.IO handler
const socketHandler = require('./socket/socketHandler');

// ─────────────────────────────────────────────────────────────
// App Setup
// ─────────────────────────────────────────────────────────────

const app = express();

// Enable CORS so the React frontend can communicate with this server
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Parse incoming JSON request bodies
app.use(express.json());

// ─────────────────────────────────────────────────────────────
// Rate Limiting
// Protects against brute-force attacks, DDoS, and API abuse
// ─────────────────────────────────────────────────────────────

/** General rate limit: 100 requests per 15 minutes per IP */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

/** Stricter limit for auth endpoints to prevent brute-force */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please wait 15 minutes.' },
});

// Apply general limiter to all API routes
app.use('/api/', generalLimiter);

// ─────────────────────────────────────────────────────────────
// Database Connection
// ─────────────────────────────────────────────────────────────

/**
 * Connect to MongoDB using the URI from environment variables.
 * The server will start even if the DB connection is initially slow.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1); // Exit the process if DB connection fails
  }
};

connectDB();

// ─────────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────────

// Health check endpoint - useful for deployment testing
app.get('/api/health-check', (req, res) => {
  res.json({
    success: true,
    message: 'Healthcare API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Mount all route modules at their respective base paths
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/admin', adminRoutes);

// ─────────────────────────────────────────────────────────────
// Global Error Handler (catches errors from all routes)
// ─────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found.`,
  });
});

// ─────────────────────────────────────────────────────────────
// HTTP Server + Socket.IO
// ─────────────────────────────────────────────────────────────

// Wrap Express in a native HTTP server so Socket.IO can attach to it
const httpServer = http.createServer(app);

// Create the Socket.IO server with CORS settings
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize all Socket.IO event handlers
socketHandler(io);

// ─────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`\n🚀 Healthcare server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  console.log(`💊 Health check: http://localhost:${PORT}/api/health-check\n`);
});

module.exports = { app, httpServer };
