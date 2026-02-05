import { Router } from 'express';
import { projectEngagementController } from '../controllers/';

const router = Router();

router.get('/', projectEngagementController.getAllProjectEngagements);
router.post('/', projectEngagementController.createProjectEngagement);
router.get('/:id', projectEngagementController.getProjectEngagementById);
router.patch('/:id', projectEngagementController.updateProjectEngagement);
router.delete('/:id', projectEngagementController.deleteProjectEngagement);

export const projectEngagementRoutes = router;
