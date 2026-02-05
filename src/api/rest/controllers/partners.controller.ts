import { Request, Response } from 'express';

interface RequestWithId extends Request {
  requestId?: string;
}

import {
  getAllPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
  createPartnerSchema,
  updatePartnerSchema,
} from '../../../core';
import { asyncHandler } from '../../../middleware';
import { logger } from '../../../config/logger';

export const partnerController = {
  getAllPartners: asyncHandler(async (_req: RequestWithId, res: Response) => {
    const partners = await getAllPartners();
    res.json(partners);
  }),

  getPartnerById: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    const partner = await getPartnerById(id);
    res.json(partner);
  }),

  createPartner: asyncHandler(async (req: RequestWithId, res: Response) => {
    const validatedData = createPartnerSchema.parse(req.body);

    logger.info('Creating partner via REST API', {
      requestId: req.requestId,
      partnerData: validatedData,
    });

    const newPartner = await createPartner(validatedData);
    res.status(201).json(newPartner);
  }),

  updatePartner: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    const validatedData = updatePartnerSchema.parse(req.body);

    logger.info('Updating partner via REST API', {
      requestId: req.requestId,
      partnerId: id,
      updateData: validatedData,
    });

    const updatedPartner = await updatePartner(id, validatedData);
    res.json(updatedPartner);
  }),

  deletePartner: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    logger.info('Deleting partner via REST API', {
      requestId: req.requestId,
      partnerId: id,
    });

    await deletePartner(id);
    res.status(204).send();
  }),
};
