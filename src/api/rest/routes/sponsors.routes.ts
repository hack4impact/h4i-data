import { Router } from 'express';
import { sponsorController } from '../controllers/';

const router = Router();

router.get('/', sponsorController.getAllSponsors);
router.post('/', sponsorController.createSponsor);
router.get('/:id', sponsorController.getSponsorById);
router.patch('/:id', sponsorController.updateSponsor);
router.delete('/:id', sponsorController.deleteSponsor);

export const sponsorRoutes = router;
