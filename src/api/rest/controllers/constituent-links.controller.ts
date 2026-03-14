import { Response } from 'express';
import {
  getAllConstituentLinks,
  getConstituentLinkById,
  createConstituentLink,
  updateConstituentLink,
  deleteConstituentLink,
  createConstituentLinkSchema,
  updateConstituentLinkSchema,
} from '../../../core';
import { asyncHandler, RequestWithId } from '../../../middleware';
import { logger } from '../../../config/logger';

export const constituentLinkController = {
  getAllConstituentLinks: asyncHandler(
    async (_req: RequestWithId, res: Response) => {
      const links = await getAllConstituentLinks();
      res.json(links);
    }
  ),

  getConstituentLinkById: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      const link = await getConstituentLinkById(id);
      res.json(link);
    }
  ),

  createConstituentLink: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const validatedData = createConstituentLinkSchema.parse(req.body);

      logger.info('Creating constituent link via REST API', {
        requestId: req.requestId,
        linkData: validatedData,
      });

      const newLink = await createConstituentLink(validatedData);
      res.status(201).json(newLink);
    }
  ),

  updateConstituentLink: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      const validatedData = updateConstituentLinkSchema.parse(req.body);

      logger.info('Updating constituent link via REST API', {
        requestId: req.requestId,
        linkId: id,
        updateData: validatedData,
      });

      const updatedLink = await updateConstituentLink(id, validatedData);
      res.json(updatedLink);
    }
  ),

  deleteConstituentLink: asyncHandler(
    async (req: RequestWithId, res: Response) => {
      const id = req.params.id as string;
      logger.info('Deleting constituent link via REST API', {
        requestId: req.requestId,
        linkId: id,
      });

      await deleteConstituentLink(id);
      res.status(204).send();
    }
  ),
};
