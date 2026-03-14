import { Response } from 'express';
import {
  getAllMentorships,
  getMentorshipById,
  createMentorship,
  updateMentorship,
  deleteMentorship,
  createMentorshipSchema,
  updateMentorshipSchema,
} from '../../../core';
import { asyncHandler, RequestWithId } from '../../../middleware';
import { logger } from '../../../config/logger';

export const mentorshipController = {
  getAllMentorships: asyncHandler(
    async (_req: RequestWithId, res: Response) => {
      const mentorships = await getAllMentorships();
      res.json(mentorships);
    }
  ),

  getMentorshipById: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    const mentorship = await getMentorshipById(id);
    res.json(mentorship);
  }),

  createMentorship: asyncHandler(async (req: RequestWithId, res: Response) => {
    const validatedData = createMentorshipSchema.parse(req.body);

    logger.info('Creating mentorship via REST API', {
      requestId: req.requestId,
      mentorshipData: validatedData,
    });

    const newMentorship = await createMentorship(validatedData);
    res.status(201).json(newMentorship);
  }),

  updateMentorship: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    const validatedData = updateMentorshipSchema.parse(req.body);

    logger.info('Updating mentorship via REST API', {
      requestId: req.requestId,
      mentorshipId: id,
      updateData: validatedData,
    });

    const updatedMentorship = await updateMentorship(id, validatedData);
    res.json(updatedMentorship);
  }),

  deleteMentorship: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    logger.info('Deleting mentorship via REST API', {
      requestId: req.requestId,
      mentorshipId: id,
    });

    await deleteMentorship(id);
    res.status(204).send();
  }),
};
