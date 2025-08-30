import express from 'express';
import { chapterRoutes } from './routes';

export const createRestApp = () => {
  const app = express();
  app.use(express.json());

  // Mount all REST routes
  app.use('/chapters', chapterRoutes);

  return app;
};
