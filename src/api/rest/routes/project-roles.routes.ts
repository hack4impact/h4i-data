import { Router } from 'express';
import { projectRoleController } from '../controllers/';

const router = Router();

router.get('/', projectRoleController.getAllProjectRoles);
router.post('/', projectRoleController.createProjectRole);
router.get('/:id', projectRoleController.getProjectRoleById);
router.patch('/:id', projectRoleController.updateProjectRole);
router.delete('/:id', projectRoleController.deleteProjectRole);

export const projectRoleRoutes = router;
