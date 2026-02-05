import { Router } from 'express';
import { constituentController } from '../controllers/';

const router = Router();

router.get('/', constituentController.getAllConstituents);
router.post('/', constituentController.createConstituent);
router.get('/:id', constituentController.getConstituentById);
router.patch('/:id', constituentController.updateConstituent);
router.delete('/:id', constituentController.deleteConstituent);

export const constituentRoutes = router;
