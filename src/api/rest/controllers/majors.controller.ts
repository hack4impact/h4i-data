import { Response } from 'express';
import {
  getAllMajors,
  getMajorById,
  createMajor,
  updateMajor,
  deleteMajor,
  createMajorSchema,
  updateMajorSchema,
} from '../../../core';
import { asyncHandler, RequestWithId } from '../../../middleware';
import { logger } from '../../../config/logger';

export const majorController = {
  getAllMajors: asyncHandler(async (_req: RequestWithId, res: Response) => {
    const majors = await getAllMajors();
    res.json(majors);
  }),

  getMajorById: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    const major = await getMajorById(id);
    res.json(major);
  }),

  createMajor: asyncHandler(async (req: RequestWithId, res: Response) => {
    const validatedData = createMajorSchema.parse(req.body);

    logger.info('Creating major via REST API', {
      requestId: req.requestId,
      majorData: validatedData,
    });

    const newMajor = await createMajor(validatedData);
    res.status(201).json(newMajor);
  }),

  updateMajor: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    const validatedData = updateMajorSchema.parse(req.body);

    logger.info('Updating major via REST API', {
      requestId: req.requestId,
      majorId: id,
      updateData: validatedData,
    });

    const updatedMajor = await updateMajor(id, validatedData);
    res.json(updatedMajor);
  }),

  deleteMajor: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    logger.info('Deleting major via REST API', {
      requestId: req.requestId,
      majorId: id,
    });

    await deleteMajor(id);
    res.status(204).send();
  }),
};
