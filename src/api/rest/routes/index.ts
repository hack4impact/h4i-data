import { Router } from 'express';
import chapterRoutes from './chapter.routes';

const router = Router();

router.use('/chapters', chapterRoutes);

export default router;
