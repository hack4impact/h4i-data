import { Router } from 'express';
import { companyController } from '../controllers/';

const router = Router();

router.get('/', companyController.getAllCompanies);
router.post('/', companyController.createCompany);
router.get('/:id', companyController.getCompanyById);
router.patch('/:id', companyController.updateCompany);
router.delete('/:id', companyController.deleteCompany);

export const companyRoutes = router;
