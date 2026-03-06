import { Response } from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  createProjectSchema,
  updateProjectSchema,
} from '../../../core';
import { asyncHandler, RequestWithId } from '../../../middleware';
import { logger } from '../../../config/logger';

export const projectController = {
  getAllProjects: asyncHandler(async (_req: RequestWithId, res: Response) => {
    const projects = await getAllProjects();
    res.json(projects);
  }),

  getProjectById: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    const project = await getProjectById(id);
    res.json(project);
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
    const id = req.params.id as string;
    // Validate input data
    const validatedData = updateProjectSchema.parse(req.body);

    logger.info('Updating project via REST API', {
      requestId: req.requestId,
      projectId: id,
      updateData: validatedData,
    });

    const updatedProject = await updateProject(id, validatedData);
    res.json(updatedProject);
  }),

  deleteProject: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    logger.info('Deleting project via REST API', {
      requestId: req.requestId,
      projectId: id,
    });

    await deleteProject(id);
    res.status(204).send();
  }),
};
