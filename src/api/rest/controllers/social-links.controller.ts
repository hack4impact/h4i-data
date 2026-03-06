import { Response } from 'express';
import {
  getAllSocialLinks,
  getSocialLinkById,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  createSocialLinkSchema,
  updateSocialLinkSchema,
} from '../../../core';
import { asyncHandler, RequestWithId } from '../../../middleware';
import { logger } from '../../../config/logger';

export const socialLinkController = {
  getAllSocialLinks: asyncHandler(
    async (_req: RequestWithId, res: Response) => {
      const links = await getAllSocialLinks();
      res.json(links);
    }
  ),

  getSocialLinkById: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    const link = await getSocialLinkById(id);
    res.json(link);
  }),

  createSocialLink: asyncHandler(async (req: RequestWithId, res: Response) => {
    const validatedData = createSocialLinkSchema.parse(req.body);

    logger.info('Creating social link via REST API', {
      requestId: req.requestId,
      linkData: validatedData,
    });

    const newLink = await createSocialLink(validatedData);
    res.status(201).json(newLink);
  }),

  updateSocialLink: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    const validatedData = updateSocialLinkSchema.parse(req.body);

    logger.info('Updating social link via REST API', {
      requestId: req.requestId,
      linkId: id,
      updateData: validatedData,
    });

    const updatedLink = await updateSocialLink(id, validatedData);
    res.json(updatedLink);
  }),

  deleteSocialLink: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    logger.info('Deleting social link via REST API', {
      requestId: req.requestId,
      linkId: id,
    });

    await deleteSocialLink(id);
    res.status(204).send();
  }),
};
