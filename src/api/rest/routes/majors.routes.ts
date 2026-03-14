import { Router } from 'express';
import { majorController } from '../controllers/';

const router = Router();

router.get('/', majorController.getAllMajors);
router.post('/', majorController.createMajor);
router.get('/:id', majorController.getMajorById);
router.patch('/:id', majorController.updateMajor);
router.delete('/:id', majorController.deleteMajor);

export const majorRoutes = router;
