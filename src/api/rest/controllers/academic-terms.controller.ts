import { Response } from 'express';
import {
  getAllAcademicTerms,
  getAcademicTermById,
  createAcademicTerm,
  updateAcademicTerm,
  deleteAcademicTerm,
  createAcademicTermSchema,
  updateAcademicTermSchema,
} from '../../../core';
import { asyncHandler, RequestWithId } from '../../../middleware';
import { logger } from '../../../config/logger';

export const academicTermController = {
  getAllAcademicTerms: asyncHandler(
    async (_req: RequestWithId, res: Response) => {
      const terms = await getAllAcademicTerms();
      res.json(terms);
    }
  ),

  getAcademicTermById: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      const term = await getAcademicTermById(id);
      res.json(term);
    }
  ),

  createAcademicTerm: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const validatedData = createAcademicTermSchema.parse(req.body);

      logger.info('Creating academic term via REST API', {
        requestId: req.requestId,
        termData: validatedData,
      });

      const newTerm = await createAcademicTerm(validatedData);
      res.status(201).json(newTerm);
    }
  ),

  updateAcademicTerm: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      const validatedData = updateAcademicTermSchema.parse(req.body);

      logger.info('Updating academic term via REST API', {
        requestId: req.requestId,
        termId: id,
        updateData: validatedData,
      });

      const updatedTerm = await updateAcademicTerm(id, validatedData);
      res.json(updatedTerm);
    }
  ),

  deleteAcademicTerm: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      logger.info('Deleting academic term via REST API', {
        requestId: req.requestId,
        termId: id,
      });

      await deleteAcademicTerm(id);
      res.status(204).send();
    }
  ),
};
