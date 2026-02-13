import { Request, Response } from 'express';

interface RequestWithId extends Request {
  requestId?: string;
}

import {
  getAllMentors,
  getMentorById,
  createMentor,
  updateMentor,
  deleteMentor,
  createMentorSchema,
  updateMentorSchema,
} from '../../../core';
import { asyncHandler } from '../../../middleware';
import { logger } from '../../../config/logger';

export const mentorController = {
  getAllMentors: asyncHandler(async (_req: RequestWithId, res: Response) => {
    const mentors = await getAllMentors();
    res.json(mentors);
  }),

  getMentorById: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    const mentor = await getMentorById(id);
    res.json(mentor);
  }),

  createMentor: asyncHandler(async (req: RequestWithId, res: Response) => {
    const validatedData = createMentorSchema.parse(req.body);

    logger.info('Creating mentor via REST API', {
      requestId: req.requestId,
      mentorData: validatedData,
    });

    const newMentor = await createMentor(validatedData);
    res.status(201).json(newMentor);
  }),

  updateMentor: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    const validatedData = updateMentorSchema.parse(req.body);

    logger.info('Updating mentor via REST API', {
      requestId: req.requestId,
      mentorId: id,
      updateData: validatedData,
    });

    const updatedMentor = await updateMentor(id, validatedData);
    res.json(updatedMentor);
  }),

  deleteMentor: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    logger.info('Deleting mentor via REST API', {
      requestId: req.requestId,
      mentorId: id,
    });

    await deleteMentor(id);
    res.status(204).send();
  }),
};
