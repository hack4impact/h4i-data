import { Request, Response } from 'express';

// Add request ID to Express Request type
interface RequestWithId extends Request {
  requestId?: string;
}

import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  createContactSchema,
  updateContactSchema,
} from '../../../core';
import { asyncHandler } from '../../../middleware';
import { logger } from '../../../config/logger';

export const contactController = {
  getAllContacts: asyncHandler(async (_req: RequestWithId, res: Response) => {
    const contacts = await getAllContacts();
    res.json(contacts);
  }),

  getContactById: asyncHandler(async (req: RequestWithId, res: Response) => {
    const contact = await getContactById(req.params.id);
    res.json(contact);
  }),

  createContact: asyncHandler(async (req: RequestWithId, res: Response) => {
    // Validate input data
    const validatedData = createContactSchema.parse(req.body);

    logger.info('Creating contact via REST API', {
      requestId: req.requestId,
      contactData: validatedData,
    });

    const newContact = await createContact(validatedData);
    res.status(201).json(newContact);
  }),

  updateContact: asyncHandler(async (req: RequestWithId, res: Response) => {
    // Validate input data
    const validatedData = updateContactSchema.parse(req.body);

    logger.info('Updating contact via REST API', {
      requestId: req.requestId,
      contactId: req.params.id,
      updateData: validatedData,
    });

    const updatedContact = await updateContact(req.params.id, validatedData);
    res.json(updatedContact);
  }),

  deleteContact: asyncHandler(async (req: RequestWithId, res: Response) => {
    logger.info('Deleting contact via REST API', {
      requestId: req.requestId,
      contactId: req.params.id,
    });

    await deleteContact(req.params.id);
    res.status(204).send();
  }),
};
