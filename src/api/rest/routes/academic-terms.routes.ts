import { Router } from 'express';
import { academicTermController } from '../controllers/';

const router = Router();

router.get('/', academicTermController.getAllAcademicTerms);
router.post('/', academicTermController.createAcademicTerm);
router.get('/:id', academicTermController.getAcademicTermById);
router.patch('/:id', academicTermController.updateAcademicTerm);
router.delete('/:id', academicTermController.deleteAcademicTerm);

export const academicTermRoutes = router;
