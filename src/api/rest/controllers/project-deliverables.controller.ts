import { Response } from 'express';
import {
  getAllProjectDeliverables,
  getProjectDeliverableById,
  createProjectDeliverable,
  updateProjectDeliverable,
  deleteProjectDeliverable,
  createProjectDeliverableSchema,
  updateProjectDeliverableSchema,
} from '../../../core';
import { asyncHandler, RequestWithId } from '../../../middleware';
import { logger } from '../../../config/logger';

export const projectDeliverableController = {
  getAllProjectDeliverables: asyncHandler(
    async (_req: RequestWithId, res: Response) => {
      const deliverables = await getAllProjectDeliverables();
      res.json(deliverables);
    }
  ),

  getProjectDeliverableById: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      const deliverable = await getProjectDeliverableById(id);
      res.json(deliverable);
    }
  ),

  createProjectDeliverable: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const validatedData = createProjectDeliverableSchema.parse(req.body);

      logger.info('Creating project deliverable via REST API', {
        requestId: req.requestId,
        deliverableData: validatedData,
      });

      const newDeliverable = await createProjectDeliverable(validatedData);
      res.status(201).json(newDeliverable);
    }
  ),

  updateProjectDeliverable: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      const validatedData = updateProjectDeliverableSchema.parse(req.body);

      logger.info('Updating project deliverable via REST API', {
        requestId: req.requestId,
        deliverableId: id,
        updateData: validatedData,
      });

      const updatedDeliverable = await updateProjectDeliverable(
        id,
        validatedData
      );
      res.json(updatedDeliverable);
    }
  ),

  deleteProjectDeliverable: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      logger.info('Deleting project deliverable via REST API', {
        requestId: req.requestId,
        deliverableId: id,
      });

      await deleteProjectDeliverable(id);
      res.status(204).send();
    }
  ),
};
