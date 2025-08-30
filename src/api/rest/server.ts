// src/api/rest/server.ts
import express from 'express';
import { chapterRoutes } from './routes';
import { env } from '../../config/server';
import { connectDB } from '../../config/database';

// This function can still be used by the main app.ts for integrated mode
export const createRestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/chapters', chapterRoutes);
  return app;
};

// --- Add this startup logic ---
const startServer = async () => {
  await connectDB();
  const app = createRestApp();
  app.listen(env.REST_PORT, () => {
    console.log(
      `REST API server listening at http://localhost:${env.REST_PORT}`
    );
  });
};

// This makes the file runnable
if (process.env.NODE_ENV !== 'test') {
  // Prevent server from starting during tests
  startServer();
}
