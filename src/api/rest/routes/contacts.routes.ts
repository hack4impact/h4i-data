import { Router } from 'express';
import { contactController } from '../controllers/';

const router = Router();

router.get('/', contactController.getAllContacts);
router.post('/', contactController.createContact);
router.get('/:id', contactController.getContactById);
router.patch('/:id', contactController.updateContact);
router.delete('/:id', contactController.deleteContact);

export const contactRoutes = router;
