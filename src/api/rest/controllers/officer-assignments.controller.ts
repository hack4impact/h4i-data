import { Response } from 'express';
import {
  getAllOfficerAssignments,
  getOfficerAssignmentById,
  createOfficerAssignment,
  updateOfficerAssignment,
  deleteOfficerAssignment,
  createOfficerAssignmentSchema,
  updateOfficerAssignmentSchema,
} from '../../../core';
import { asyncHandler, RequestWithId } from '../../../middleware';
import { logger } from '../../../config/logger';

export const officerAssignmentController = {
  getAllOfficerAssignments: asyncHandler(
    async (_req: RequestWithId, res: Response) => {
      const assignments = await getAllOfficerAssignments();
      res.json(assignments);
    }
  ),

  getOfficerAssignmentById: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      const assignment = await getOfficerAssignmentById(id);
      res.json(assignment);
    }
  ),

  createOfficerAssignment: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const validatedData = createOfficerAssignmentSchema.parse(req.body);

      logger.info('Creating officer assignment via REST API', {
        requestId: req.requestId,
        assignmentData: validatedData,
      });

      const newAssignment = await createOfficerAssignment(validatedData);
      res.status(201).json(newAssignment);
    }
  ),

  updateOfficerAssignment: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      const validatedData = updateOfficerAssignmentSchema.parse(req.body);

      logger.info('Updating officer assignment via REST API', {
        requestId: req.requestId,
        assignmentId: id,
        updateData: validatedData,
      });

      const updatedAssignment = await updateOfficerAssignment(
        id,
        validatedData
      );
      res.json(updatedAssignment);
    }
  ),

  deleteOfficerAssignment: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      logger.info('Deleting officer assignment via REST API', {
        requestId: req.requestId,
        assignmentId: id,
      });

      await deleteOfficerAssignment(id);
      res.status(204).send();
    }
  ),
};
