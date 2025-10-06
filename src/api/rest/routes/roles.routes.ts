import { Router } from 'express';
import { roleController } from '../controllers/';

const router = Router();

router.get('/', roleController.getAllRoles);
router.post('/', roleController.createRole);
router.get('/:id', roleController.getRoleById);
router.patch('/:id', roleController.updateRole);
router.delete('/:id', roleController.deleteRole);

export const roleRoutes = router;
