import { Router } from 'express';
import { socialLinkController } from '../controllers/';

const router = Router();

router.get('/', socialLinkController.getAllSocialLinks);
router.post('/', socialLinkController.createSocialLink);
router.get('/:id', socialLinkController.getSocialLinkById);
router.patch('/:id', socialLinkController.updateSocialLink);
router.delete('/:id', socialLinkController.deleteSocialLink);

export const socialLinkRoutes = router;
