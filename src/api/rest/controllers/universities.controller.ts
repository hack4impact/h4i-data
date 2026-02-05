import { Request, Response } from 'express';

interface RequestWithId extends Request {
  requestId?: string;
}

import {
  getAllUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  createUniversitySchema,
  updateUniversitySchema,
} from '../../../core';
import { asyncHandler } from '../../../middleware';
import { logger } from '../../../config/logger';

export const universityController = {
  getAllUniversities: asyncHandler(
    async (_req: RequestWithId, res: Response) => {
      const universities = await getAllUniversities();
      res.json(universities);
    }
  ),

  getUniversityById: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    const university = await getUniversityById(id);
    res.json(university);
  }),

  createUniversity: asyncHandler(async (req: RequestWithId, res: Response) => {
    const validatedData = createUniversitySchema.parse(req.body);

    logger.info('Creating university via REST API', {
      requestId: req.requestId,
      universityData: validatedData,
    });

    const newUniversity = await createUniversity(validatedData);
    res.status(201).json(newUniversity);
  }),

  updateUniversity: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    const validatedData = updateUniversitySchema.parse(req.body);

    logger.info('Updating university via REST API', {
      requestId: req.requestId,
      universityId: id,
      updateData: validatedData,
    });

    const updatedUniversity = await updateUniversity(id, validatedData);
    res.json(updatedUniversity);
  }),

  deleteUniversity: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    logger.info('Deleting university via REST API', {
      requestId: req.requestId,
      universityId: id,
    });

    await deleteUniversity(id);
    res.status(204).send();
  }),
};
