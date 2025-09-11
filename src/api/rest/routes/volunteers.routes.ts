import { Router } from 'express';
import { volunteerController } from '../controllers/volunteers.controller';

const router = Router();

router.get('/', volunteerController.getAllVolunteers);
router.post('/', volunteerController.createVolunteer);
router.get('/:id', volunteerController.getVolunteerById);
router.patch('/:id', volunteerController.updateVolunteer);
router.delete('/:id', volunteerController.deleteVolunteer);

export const volunteerRoutes = router;
