import { Request, Response } from 'express';

interface RequestWithId extends Request {
  requestId?: string;
}

import {
  getAllOfficerRoles,
  getOfficerRoleById,
  createOfficerRole,
  updateOfficerRole,
  deleteOfficerRole,
  createOfficerRoleSchema,
  updateOfficerRoleSchema,
} from '../../../core';
import { asyncHandler } from '../../../middleware';
import { logger } from '../../../config/logger';

export const officerRoleController = {
  getAllOfficerRoles: asyncHandler(
    async (_req: RequestWithId, res: Response) => {
      const roles = await getAllOfficerRoles();
      res.json(roles);
    }
  ),

  getOfficerRoleById: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      const role = await getOfficerRoleById(id);
      res.json(role);
    }
  ),

  createOfficerRole: asyncHandler(async (req: RequestWithId, res: Response) => {
    const validatedData = createOfficerRoleSchema.parse(req.body);

    logger.info('Creating officer role via REST API', {
      requestId: req.requestId,
      roleData: validatedData,
    });

    const newRole = await createOfficerRole(validatedData);
    res.status(201).json(newRole);
  }),

  updateOfficerRole: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    const validatedData = updateOfficerRoleSchema.parse(req.body);

    logger.info('Updating officer role via REST API', {
      requestId: req.requestId,
      roleId: id,
      updateData: validatedData,
    });

    const updatedRole = await updateOfficerRole(id, validatedData);
    res.json(updatedRole);
  }),

  deleteOfficerRole: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    logger.info('Deleting officer role via REST API', {
      requestId: req.requestId,
      roleId: id,
    });

    await deleteOfficerRole(id);
    res.status(204).send();
  }),
};
