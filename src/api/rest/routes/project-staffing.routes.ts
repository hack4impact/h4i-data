import { Router } from 'express';
import { projectStaffingController } from '../controllers/';

const router = Router();

router.get('/', projectStaffingController.getAllProjectStaffing);
router.post('/', projectStaffingController.createProjectStaffing);
router.get('/:id', projectStaffingController.getProjectStaffingById);
router.patch('/:id', projectStaffingController.updateProjectStaffing);
router.delete('/:id', projectStaffingController.deleteProjectStaffing);

export const projectStaffingRoutes = router;
