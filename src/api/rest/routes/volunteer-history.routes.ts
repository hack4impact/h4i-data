import { Router } from 'express';
import { volunteerHistoryController } from '../controllers/';

const router = Router();

router.get('/', volunteerHistoryController.getAllVolunteerHistory);
router.post('/', volunteerHistoryController.createVolunteerHistory);
router.get('/:id', volunteerHistoryController.getVolunteerHistoryById);
router.patch('/:id', volunteerHistoryController.updateVolunteerHistory);
router.delete('/:id', volunteerHistoryController.deleteVolunteerHistory);

export const volunteerHistoryRoutes = router;
