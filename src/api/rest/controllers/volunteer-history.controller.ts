import { Response } from 'express';
import {
  getAllVolunteerHistory,
  getVolunteerHistoryById,
  createVolunteerHistory,
  updateVolunteerHistory,
  deleteVolunteerHistory,
  createVolunteerHistorySchema,
  updateVolunteerHistorySchema,
} from '../../../core';
import { asyncHandler, RequestWithId } from '../../../middleware';
import { logger } from '../../../config/logger';

export const volunteerHistoryController = {
  getAllVolunteerHistory: asyncHandler(
    async (_req: RequestWithId, res: Response) => {
      const history = await getAllVolunteerHistory();
      res.json(history);
    }
  ),

  getVolunteerHistoryById: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      const history = await getVolunteerHistoryById(id);
      res.json(history);
    }
  ),

  createVolunteerHistory: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const validatedData = createVolunteerHistorySchema.parse(req.body);

      logger.info('Creating volunteer history via REST API', {
        requestId: req.requestId,
        historyData: validatedData,
      });

      const newHistory = await createVolunteerHistory(validatedData);
      res.status(201).json(newHistory);
    }
  ),

  updateVolunteerHistory: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      const validatedData = updateVolunteerHistorySchema.parse(req.body);

      logger.info('Updating volunteer history via REST API', {
        requestId: req.requestId,
        historyId: id,
        updateData: validatedData,
      });

      const updatedHistory = await updateVolunteerHistory(id, validatedData);
      res.json(updatedHistory);
    }
  ),

  deleteVolunteerHistory: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      logger.info('Deleting volunteer history via REST API', {
        requestId: req.requestId,
        historyId: id,
      });

      await deleteVolunteerHistory(id);
      res.status(204).send();
    }
  ),
};
