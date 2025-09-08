import { Request, Response } from 'express';

// Add request ID to Express Request type
interface RequestWithId extends Request {
  requestId?: string;
}
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  createProjectSchema,
  updateProjectSchema,
} from '../../../core';
import { asyncHandler } from '../../../middleware';
import { logger } from '../../../config/logger';

export const projectController = {
  getAllProjects: asyncHandler(async (_req: RequestWithId, res: Response) => {
    const projects = await getAllProjects();
    res.json(projects);
  }),

  getProjectById: asyncHandler(async (req: RequestWithId, res: Response) => {
    const projects = await getProjectById(req.params.id);
    res.json(projects);
  }),

  createProject: asyncHandler(async (req: RequestWithId, res: Response) => {
    // Validate input data
    const validatedData = createProjectSchema.parse(req.body);

    logger.info('Creating project via REST API', {
      requestId: req.requestId,
      projectData: validatedData,
    });

    const newProject = await createProject(validatedData);
    res.status(201).json(newProject);
  }),

  updateProject: asyncHandler(async (req: RequestWithId, res: Response) => {
    // Validate input data
    const validatedData = updateProjectSchema.parse(req.body);

    logger.info('Updating project via REST API', {
      requestId: req.requestId,
      projectId: req.params.id,
      updateData: validatedData,
    });

    const updatedProject = await updateProject(req.params.id, validatedData);
    res.json(updatedProject);
  }),

  deleteProject: asyncHandler(async (req: RequestWithId, res: Response) => {
    logger.info('Deleting project via REST API', {
      requestId: req.requestId,
      projectId: req.params.id,
    });

    await deleteProject(req.params.id);
    res.status(204).send();
  }),
};
