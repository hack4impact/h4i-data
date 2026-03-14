import { Router } from 'express';
import { mentorshipController } from '../controllers/';

const router = Router();

router.get('/', mentorshipController.getAllMentorships);
router.post('/', mentorshipController.createMentorship);
router.get('/:id', mentorshipController.getMentorshipById);
router.patch('/:id', mentorshipController.updateMentorship);
router.delete('/:id', mentorshipController.deleteMentorship);

export const mentorshipRoutes = router;
