import { Response } from 'express';
import {
  getAllConstituents,
  getConstituentById,
  createConstituent,
  updateConstituent,
  deleteConstituent,
  createConstituentSchema,
  updateConstituentSchema,
} from '../../../core';
import { asyncHandler, RequestWithId } from '../../../middleware';
import { logger } from '../../../config/logger';

export const constituentController = {
  getAllConstituents: asyncHandler(
    async (_req: RequestWithId, res: Response) => {
      const constituents = await getAllConstituents();
      res.json(constituents);
    }
  ),

  getConstituentById: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      const constituent = await getConstituentById(id);
      res.json(constituent);
    }
  ),

  createConstituent: asyncHandler(async (req: RequestWithId, res: Response) => {
    const validatedData = createConstituentSchema.parse(req.body);

    logger.info('Creating constituent via REST API', {
      requestId: req.requestId,
      constituentData: validatedData,
    });

    const newConstituent = await createConstituent(validatedData);
    res.status(201).json(newConstituent);
  }),

  updateConstituent: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    const validatedData = updateConstituentSchema.parse(req.body);

    logger.info('Updating constituent via REST API', {
      requestId: req.requestId,
      constituentId: id,
      updateData: validatedData,
    });

    const updatedConstituent = await updateConstituent(id, validatedData);
    res.json(updatedConstituent);
  }),

  deleteConstituent: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    logger.info('Deleting constituent via REST API', {
      requestId: req.requestId,
      constituentId: id,
    });

    await deleteConstituent(id);
    res.status(204).send();
  }),
};
