import { Router } from 'express';
import { universityController } from '../controllers/';

const router = Router();

router.get('/', universityController.getAllUniversities);
router.post('/', universityController.createUniversity);
router.get('/:id', universityController.getUniversityById);
router.patch('/:id', universityController.updateUniversity);
router.delete('/:id', universityController.deleteUniversity);

export const universityRoutes = router;
