import { Router } from 'express';
import { constituentLinkController } from '../controllers/';

const router = Router();

router.get('/', constituentLinkController.getAllConstituentLinks);
router.post('/', constituentLinkController.createConstituentLink);
router.get('/:id', constituentLinkController.getConstituentLinkById);
router.patch('/:id', constituentLinkController.updateConstituentLink);
router.delete('/:id', constituentLinkController.deleteConstituentLink);

export const constituentLinkRoutes = router;
