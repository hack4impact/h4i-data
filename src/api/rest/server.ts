import express from 'express';
import router from './routes'; // This now correctly imports your main router
import { env } from '../../config/server';
import { connectDB } from '../../config/database';

export const createRestApp = () => {
  const app = express();
  app.use(express.json());

  // Use the main router for all API endpoints.
  // A request to this server at /chapters will now be handled.
  app.use('/', router);

  return app;
};

const startServer = async () => {
  await connectDB();
  const app = createRestApp();

  app.listen(env.REST_PORT, () => {
    console.log(
      `REST API server listening at http://localhost:${env.REST_PORT}`
    );
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
