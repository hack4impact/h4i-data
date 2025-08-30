import express from 'express';
import cors from 'cors';
import { apiRoutes } from './routes';
import { errorHandler, notFoundHandler } from './middleware';
import { connectToDB, disconnectFromDB } from '../config/database';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// API routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Volunteer Management REST API',
    version: '1.0.0',
    endpoints: {
      volunteers: '/api/volunteers',
      health: '/api/health',
    },
  });
});

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.REST_PORT || 3001;

// Start server function
export async function startRestServer() {
  try {
    // Connect to database
    await connectToDB();

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 REST API Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down REST server gracefully...');
      server.close(async () => {
        await disconnectFromDB();
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    console.error('Failed to start REST server:', error);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (require.main === module) {
  startRestServer();
}

export { app };
