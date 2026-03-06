import { Response } from 'express';
import {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  createLocationSchema,
  updateLocationSchema,
} from '../../../core';
import { asyncHandler, RequestWithId } from '../../../middleware';
import { logger } from '../../../config/logger';

export const locationController = {
  getAllLocations: asyncHandler(async (_req: RequestWithId, res: Response) => {
    const locations = await getAllLocations();
    res.json(locations);
  }),

  getLocationById: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    const location = await getLocationById(id);
    res.json(location);
  }),

  createLocation: asyncHandler(async (req: RequestWithId, res: Response) => {
    const validatedData = createLocationSchema.parse(req.body);

    logger.info('Creating location via REST API', {
      requestId: req.requestId,
      locationData: validatedData,
    });

    const newLocation = await createLocation(validatedData);
    res.status(201).json(newLocation);
  }),

  updateLocation: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    const validatedData = updateLocationSchema.parse(req.body);

    logger.info('Updating location via REST API', {
      requestId: req.requestId,
      locationId: id,
      updateData: validatedData,
    });

    const updatedLocation = await updateLocation(id, validatedData);
    res.json(updatedLocation);
  }),

  deleteLocation: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    logger.info('Deleting location via REST API', {
      requestId: req.requestId,
      locationId: id,
    });

    await deleteLocation(id);
    res.status(204).send();
  }),
};
