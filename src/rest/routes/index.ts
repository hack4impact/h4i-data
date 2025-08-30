import { Router } from 'express';
import { volunteerRoutes } from './volunteerRoutes';

const router = Router();

// mount feature routes, creates path prefix for all volunteer routes
router.use('/volunteers', volunteerRoutes);

// health check for REST API
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'REST API',
    timestamp: new Date().toISOString(),
  });
});

export { router as apiRoutes };
