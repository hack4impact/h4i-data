import { Router } from 'express';
import { chapterController } from '../controllers/chapter.controller';

const router = Router();

router.get('/', chapterController.getAllChapters);
router.post('/', chapterController.createChapter);
router.get('/:id', chapterController.getChapterById);
router.patch('/:id', chapterController.updateChapter);
router.delete('/:id', chapterController.deleteChapter);

export const chapterRoutes = router;
