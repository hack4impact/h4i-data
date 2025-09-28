import { Router } from 'express';
import { projectController } from '../controllers/';

const router = Router();

router.get('/', projectController.getAllProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProjectById);
router.patch('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

export const projectRoutes = router;
