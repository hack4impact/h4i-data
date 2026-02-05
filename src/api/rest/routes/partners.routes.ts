import { Router } from 'express';
import { partnerController } from '../controllers/';

const router = Router();

router.get('/', partnerController.getAllPartners);
router.post('/', partnerController.createPartner);
router.get('/:id', partnerController.getPartnerById);
router.patch('/:id', partnerController.updatePartner);
router.delete('/:id', partnerController.deletePartner);

export const partnerRoutes = router;
