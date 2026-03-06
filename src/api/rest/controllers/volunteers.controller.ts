import { Response } from 'express';
import {
  getAllVolunteers,
  getVolunteerById,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  createVolunteerSchema,
  updateVolunteerSchema,
} from '../../../core';
import { asyncHandler, RequestWithId } from '../../../middleware';
import { logger } from '../../../config/logger';

export const volunteerController = {
  getAllVolunteers: asyncHandler(async (_req: RequestWithId, res: Response) => {
    const volunteers = await getAllVolunteers();
    res.json(volunteers);
  }),

  getVolunteerById: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    const volunteer = await getVolunteerById(id);
    res.json(volunteer);
  }),

  createVolunteer: asyncHandler(async (req: RequestWithId, res: Response) => {
    const validatedData = createVolunteerSchema.parse(req.body);

    logger.info('Creating volunteer via REST API', {
      requestId: req.requestId,
      volunteerData: validatedData,
    });

    const newVolunteer = await createVolunteer(validatedData);
    res.status(201).json(newVolunteer);
  }),

  updateVolunteer: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    const validatedData = updateVolunteerSchema.parse(req.body);

    logger.info('Updating volunteer via REST API', {
      requestId: req.requestId,
      volunteerId: id,
      updateData: validatedData,
    });

    const updatedVolunteer = await updateVolunteer(id, validatedData);
    res.json(updatedVolunteer);
  }),

  deleteVolunteer: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    logger.info('Deleting volunteer via REST API', {
      requestId: req.requestId,
      volunteerId: id,
    });

    await deleteVolunteer(id);
    res.status(204).send();
  }),
};
