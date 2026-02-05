import { Request, Response } from 'express';

interface RequestWithId extends Request {
  requestId?: string;
}

import {
  getAllProjectEngagements,
  getProjectEngagementById,
  createProjectEngagement,
  updateProjectEngagement,
  deleteProjectEngagement,
  createProjectEngagementSchema,
  updateProjectEngagementSchema,
} from '../../../core';
import { asyncHandler } from '../../../middleware';
import { logger } from '../../../config/logger';

export const projectEngagementController = {
  getAllProjectEngagements: asyncHandler(
    async (_req: RequestWithId, res: Response) => {
      const engagements = await getAllProjectEngagements();
      res.json(engagements);
    }
  ),

  getProjectEngagementById: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      const engagement = await getProjectEngagementById(id);
      res.json(engagement);
    }
  ),

  createProjectEngagement: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const validatedData = createProjectEngagementSchema.parse(req.body);

      logger.info('Creating project engagement via REST API', {
        requestId: req.requestId,
        engagementData: validatedData,
      });

      const newEngagement = await createProjectEngagement(validatedData);
      res.status(201).json(newEngagement);
    }
  ),

  updateProjectEngagement: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      const validatedData = updateProjectEngagementSchema.parse(req.body);

      logger.info('Updating project engagement via REST API', {
        requestId: req.requestId,
        engagementId: id,
        updateData: validatedData,
      });

      const updatedEngagement = await updateProjectEngagement(
        id,
        validatedData
      );
      res.json(updatedEngagement);
    }
  ),

  deleteProjectEngagement: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      logger.info('Deleting project engagement via REST API', {
        requestId: req.requestId,
        engagementId: id,
      });

      await deleteProjectEngagement(id);
      res.status(204).send();
    }
  ),
};
