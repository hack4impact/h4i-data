import { Request, Response } from 'express';

// Add request ID to Express Request type
interface RequestWithId extends Request {
  requestId?: string;
}
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  createCompanySchema,
  updateCompanySchema,
} from '../../../core';
import { asyncHandler } from '../../../middleware';
import { logger } from '../../../config/logger';

export const companyController = {
  getAllCompanies: asyncHandler(async (_req: RequestWithId, res: Response) => {
    const companies = await getAllCompanies();
    res.json(companies);
  }),

  getCompanyById: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    const company = await getCompanyById(id);
    res.json(company);
  }),

  createCompany: asyncHandler(async (req: RequestWithId, res: Response) => {
    // Validate input data
    const validatedData = createCompanySchema.parse(req.body);

    logger.info('Creating company via REST API', {
      requestId: req.requestId,
      companyData: validatedData,
    });

    const newCompany = await createCompany(validatedData);
    res.status(201).json(newCompany);
  }),

  updateCompany: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    // Validate input data
    const validatedData = updateCompanySchema.parse(req.body);

    logger.info('Updating company via REST API', {
      requestId: req.requestId,
      companyId: id,
      updateData: validatedData,
    });

    const updatedCompany = await updateCompany(id, validatedData);
    res.json(updatedCompany);
  }),

  deleteCompany: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    logger.info('Deleting company via REST API', {
      requestId: req.requestId,
      companyId: id,
    });

    await deleteCompany(id);
    res.status(204).send();
  }),
};
