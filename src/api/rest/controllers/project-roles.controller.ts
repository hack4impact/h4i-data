import { Response } from 'express';
import {
  getAllProjectRoles,
  getProjectRoleById,
  createProjectRole,
  updateProjectRole,
  deleteProjectRole,
  createProjectRoleSchema,
  updateProjectRoleSchema,
} from '../../../core';
import { asyncHandler, RequestWithId } from '../../../middleware';
import { logger } from '../../../config/logger';

export const projectRoleController = {
  getAllProjectRoles: asyncHandler(
    async (_req: RequestWithId, res: Response) => {
      const roles = await getAllProjectRoles();
      res.json(roles);
    }
  ),

  getProjectRoleById: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      const role = await getProjectRoleById(id);
      res.json(role);
    }
  ),

  createProjectRole: asyncHandler(async (req: RequestWithId, res: Response) => {
    const validatedData = createProjectRoleSchema.parse(req.body);

    logger.info('Creating project role via REST API', {
      requestId: req.requestId,
      roleData: validatedData,
    });

    const newRole = await createProjectRole(validatedData);
    res.status(201).json(newRole);
  }),

  updateProjectRole: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    const validatedData = updateProjectRoleSchema.parse(req.body);

    logger.info('Updating project role via REST API', {
      requestId: req.requestId,
      roleId: id,
      updateData: validatedData,
    });

    const updatedRole = await updateProjectRole(id, validatedData);
    res.json(updatedRole);
  }),

  deleteProjectRole: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    logger.info('Deleting project role via REST API', {
      requestId: req.requestId,
      roleId: id,
    });

    await deleteProjectRole(id);
    res.status(204).send();
  }),
};
