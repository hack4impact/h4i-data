import { Request, Response } from 'express';

// Add request ID to Express Request type
interface RequestWithId extends Request {
  requestId?: string;
}
import {
  getAllSponsors,
  getSponsorById,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  createSponsorSchema,
  updateSponsorSchema,
} from '../../../core';
import { asyncHandler } from '../../../middleware';
import { logger } from '../../../config/logger';

export const sponsorController = {
  getAllSponsors: asyncHandler(async (_req: RequestWithId, res: Response) => {
    const sponsors = await getAllSponsors();
    res.json(sponsors);
  }),

  getSponsorById: asyncHandler(async (req: RequestWithId, res: Response) => {
    const sponsor = await getSponsorById(req.params.id);
    res.json(sponsor);
  }),

  createSponsor: asyncHandler(async (req: RequestWithId, res: Response) => {
    // Validate input data
    const validatedData = createSponsorSchema.parse(req.body);

    logger.info('Creating sponsor via REST API', {
      requestId: req.requestId,
      sponsorData: validatedData,
    });

    const newSponsor = await createSponsor(validatedData);
    res.status(201).json(newSponsor);
  }),

  updateSponsor: asyncHandler(async (req: RequestWithId, res: Response) => {
    // Validate input data
    const validatedData = updateSponsorSchema.parse(req.body);

    logger.info('Updating sponsor via REST API', {
      requestId: req.requestId,
      sponsorId: req.params.id,
      updateData: validatedData,
    });

    const updatedSponsor = await updateSponsor(req.params.id, validatedData);
    res.json(updatedSponsor);
  }),

  deleteSponsor: asyncHandler(async (req: RequestWithId, res: Response) => {
    logger.info('Deleting sponsor via REST API', {
      requestId: req.requestId,
      sponsorId: req.params.id,
    });

    await deleteSponsor(req.params.id);
    res.status(204).send();
  }),
};
