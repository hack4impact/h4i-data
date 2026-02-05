import { Request, Response } from 'express';

interface RequestWithId extends Request {
  requestId?: string;
}

import {
  getAllProjectStaffing,
  getProjectStaffingById,
  createProjectStaffing,
  updateProjectStaffing,
  deleteProjectStaffing,
  createProjectStaffingSchema,
  updateProjectStaffingSchema,
} from '../../../core';
import { asyncHandler } from '../../../middleware';
import { logger } from '../../../config/logger';

export const projectStaffingController = {
  getAllProjectStaffing: asyncHandler(
    async (_req: RequestWithId, res: Response) => {
      const staffing = await getAllProjectStaffing();
      res.json(staffing);
    }
  ),

  getProjectStaffingById: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      const staffing = await getProjectStaffingById(id);
      res.json(staffing);
    }
  ),

  createProjectStaffing: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const validatedData = createProjectStaffingSchema.parse(req.body);

      logger.info('Creating project staffing via REST API', {
        requestId: req.requestId,
        staffingData: validatedData,
      });

      const newStaffing = await createProjectStaffing(validatedData);
      res.status(201).json(newStaffing);
    }
  ),

  updateProjectStaffing: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      const validatedData = updateProjectStaffingSchema.parse(req.body);

      logger.info('Updating project staffing via REST API', {
        requestId: req.requestId,
        staffingId: id,
        updateData: validatedData,
      });

      const updatedStaffing = await updateProjectStaffing(id, validatedData);
      res.json(updatedStaffing);
    }
  ),

  deleteProjectStaffing: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      logger.info('Deleting project staffing via REST API', {
        requestId: req.requestId,
        staffingId: id,
      });

      await deleteProjectStaffing(id);
      res.status(204).send();
    }
  ),
};
