import { Router } from 'express';
// Import everything exported from the barrel file into a single namespace
import * as featureRoutes from './routes/index';

const router = Router();

// Mount the chapter routes under the /chapters path
router.use('/chapters', featureRoutes.chapterRoutes);
router.use('/projects', featureRoutes.projectRoutes);
router.use('/volunteers', featureRoutes.volunteerRoutes);

// Example of how you would add more routes in the future
// mainRouter.use('/users', featureRoutes.userRoutes);

export default router;
