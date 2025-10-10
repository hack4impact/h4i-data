import { Router } from 'express';
import { nonprofitController } from '../controllers/';

const router = Router();

router.get('/', nonprofitController.getAllNonprofits);
router.post('/', nonprofitController.createNonprofit);
router.get('/:id', nonprofitController.getNonprofitById);
router.patch('/:id', nonprofitController.updateNonprofit);
router.delete('/:id', nonprofitController.deleteNonprofit);

export const nonprofitRoutes = router;
