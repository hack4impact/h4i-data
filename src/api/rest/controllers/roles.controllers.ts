import { Request, Response } from 'express';

// Add request ID to Express Request type
interface RequestWithId extends Request {
  requestId?: string;
}

import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  createRoleSchema,
  updateRoleSchema,
} from '../../../core';
import { asyncHandler } from '../../../middleware';
import { logger } from '../../../config/logger';

export const roleController = {
  getAllRoles: asyncHandler(async (_req: RequestWithId, res: Response) => {
    const roles = await getAllRoles();
    res.json(roles);
  }),

  getRoleById: asyncHandler(async (req: RequestWithId, res: Response) => {
    const role = await getRoleById(req.params.id);
    res.json(role);
  }),

  createRole: asyncHandler(async (req: RequestWithId, res: Response) => {
    // Validate input data
    const validatedData = createRoleSchema.parse(req.body);

    logger.info('Creating role via REST API', {
      requestId: req.requestId,
      roleData: validatedData,
    });

    const newRole = await createRole(validatedData);
    res.status(201).json(newRole);
  }),

  updateRole: asyncHandler(async (req: RequestWithId, res: Response) => {
    // Validate input data
    const validatedData = updateRoleSchema.parse(req.body);

    logger.info('Updating role via REST API', {
      requestId: req.requestId,
      roleId: req.params.id,
      updateData: validatedData,
    });

    const updatedRole = await updateRole(req.params.id, validatedData);
    res.json(updatedRole);
  }),

  deleteRole: asyncHandler(async (req: RequestWithId, res: Response) => {
    logger.info('Deleting role via REST API', {
      requestId: req.requestId,
      roleId: req.params.id,
    });

    await deleteRole(req.params.id);
    res.status(204).send();
  }),
};
