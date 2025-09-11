import { Request, Response } from 'express';

// Add request ID to Express Request type
interface RequestWithId extends Request {
  requestId?: string;
}
import {
  getAllVolunteers,
  getVolunteerById,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  createVolunteerSchema,
  updateVolunteerSchema,
} from '../../../core';
import { asyncHandler } from '../../../middleware';
import { logger } from '../../../config/logger';

export const volunteerController = {
  getAllVolunteers: asyncHandler(async (_req: RequestWithId, res: Response) => {
    const volunteers = await getAllVolunteers();
    res.json(volunteers);
  }),

  getVolunteerById: asyncHandler(async (req: RequestWithId, res: Response) => {
    const volunteer = await getVolunteerById(req.params.id);
    res.json(volunteer);
  }),

  createVolunteer: asyncHandler(async (req: RequestWithId, res: Response) => {
    // Validate input data
    const validatedData = createVolunteerSchema.parse(req.body);

    logger.info('Creating volunteer via REST API', {
      requestId: req.requestId,
      volunteerData: validatedData,
    });

    const newVolunteer = await createVolunteer(validatedData);
    res.status(201).json(newVolunteer);
  }),

  updateVolunteer: asyncHandler(async (req: RequestWithId, res: Response) => {
    // Validate input data
    const validatedData = updateVolunteerSchema.parse(req.body);

    logger.info('Updating volunteer via REST API', {
      requestId: req.requestId,
      volunteerId: req.params.id,
      updateData: validatedData,
    });

    const updatedVolunteer = await updateVolunteer(
      req.params.id,
      validatedData
    );
    res.json(updatedVolunteer);
  }),

  deleteVolunteer: asyncHandler(async (req: RequestWithId, res: Response) => {
    logger.info('Deleting volunteer via REST API', {
      requestId: req.requestId,
      volunteerId: req.params.id,
    });

    await deleteVolunteer(req.params.id);
    res.status(204).send();
  }),
};
