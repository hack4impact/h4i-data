import { Request, Response } from 'express';

// Add request ID to Express Request type
interface RequestWithId extends Request {
  requestId?: string;
}
import {
  getAllNonprofits,
  getNonprofitById,
  createNonprofit,
  updateNonprofit,
  deleteNonprofit,
  createNonprofitSchema,
  updateNonprofitSchema,
} from '../../../core';
import { asyncHandler } from '../../../middleware';
import { logger } from '../../../config/logger';

export const nonprofitController = {
  getAllNonprofits: asyncHandler(async (_req: RequestWithId, res: Response) => {
    const nonprofits = await getAllNonprofits();
    res.json(nonprofits);
  }),

  getNonprofitById: asyncHandler(async (req: RequestWithId, res: Response) => {
    const nonprofit = await getNonprofitById(req.params.id);
    res.json(nonprofit);
  }),

  createNonprofit: asyncHandler(async (req: RequestWithId, res: Response) => {
    // Validate input data
    const validatedData = createNonprofitSchema.parse(req.body);

    logger.info('Creating nonprofit via REST API', {
      requestId: req.requestId,
      nonprofitData: validatedData,
    });

    const newNonprofit = await createNonprofit(validatedData);
    res.status(201).json(newNonprofit);
  }),

  updateNonprofit: asyncHandler(async (req: RequestWithId, res: Response) => {
    // Validate input data
    const validatedData = updateNonprofitSchema.parse(req.body);

    logger.info('Updating nonprofit via REST API', {
      requestId: req.requestId,
      nonprofitId: req.params.id,
      updateData: validatedData,
    });

    const updatedNonprofit = await updateNonprofit(req.params.id, validatedData);
    res.json(updatedNonprofit);
  }),

  deleteNonprofit: asyncHandler(async (req: RequestWithId, res: Response) => {
    logger.info('Deleting nonprofit via REST API', {
      requestId: req.requestId,
      nonprofitId: req.params.id,
    });

    await deleteNonprofit(req.params.id);
    res.status(204).send();
  }),
};
