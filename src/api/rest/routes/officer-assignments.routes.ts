import { Router } from 'express';
import { officerAssignmentController } from '../controllers/';

const router = Router();

router.get('/', officerAssignmentController.getAllOfficerAssignments);
router.post('/', officerAssignmentController.createOfficerAssignment);
router.get('/:id', officerAssignmentController.getOfficerAssignmentById);
router.patch('/:id', officerAssignmentController.updateOfficerAssignment);
router.delete('/:id', officerAssignmentController.deleteOfficerAssignment);

export const officerAssignmentRoutes = router;
