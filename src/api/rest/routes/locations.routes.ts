import { Router } from 'express';
import { locationController } from '../controllers/locations.controller';

const router = Router();

router.get('/', locationController.getAllLocations);
router.post('/', locationController.createLocation);
router.get('/:id', locationController.getLocationById);
router.patch('/:id', locationController.updateLocation);
router.delete('/:id', locationController.deleteLocation);

export const locationRoutes = router;
