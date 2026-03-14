import { Router } from 'express';
import { mentorController } from '../controllers/';

const router = Router();

router.get('/', mentorController.getAllMentors);
router.post('/', mentorController.createMentor);
router.get('/:id', mentorController.getMentorById);
router.patch('/:id', mentorController.updateMentor);
router.delete('/:id', mentorController.deleteMentor);

export const mentorRoutes = router;
