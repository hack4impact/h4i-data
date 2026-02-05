import { Router } from 'express';
import { projectDeliverableController } from '../controllers/';

const router = Router();

router.get('/', projectDeliverableController.getAllProjectDeliverables);
router.post('/', projectDeliverableController.createProjectDeliverable);
router.get('/:id', projectDeliverableController.getProjectDeliverableById);
router.patch('/:id', projectDeliverableController.updateProjectDeliverable);
router.delete('/:id', projectDeliverableController.deleteProjectDeliverable);

export const projectDeliverableRoutes = router;
