import { Router } from 'express';
import { officerRoleController } from '../controllers/';

const router = Router();

router.get('/', officerRoleController.getAllOfficerRoles);
router.post('/', officerRoleController.createOfficerRole);
router.get('/:id', officerRoleController.getOfficerRoleById);
router.patch('/:id', officerRoleController.updateOfficerRole);
router.delete('/:id', officerRoleController.deleteOfficerRole);

export const officerRoleRoutes = router;
