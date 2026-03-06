import {
  createCompany,
  createCompanySchema,
  deleteCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  updateCompanySchema,
} from '../../../core';
import { NotFoundError } from '../../../middleware/error.middleware';
import { z } from 'zod';

type CreateCompanyInput = z.infer<typeof createCompanySchema>;
type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export const companyResolvers = {
  Query: {
    companies: () => getAllCompanies(),
    company: async (_parent: unknown, { id }: { id: string }) => {
      try {
        return await getCompanyById(id);
      } catch (error) {
        if (error instanceof NotFoundError) return null;
        throw error;
      }
    },
  },
  Mutation: {
    createCompany: (
      _parent: unknown,
      { input }: { input: CreateCompanyInput }
    ) => {
      const validatedInput = createCompanySchema.parse(input);
      return createCompany(validatedInput);
    },
    updateCompany: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateCompanyInput }
    ) => {
      const validatedInput = updateCompanySchema.parse(input);
      return updateCompany(id, validatedInput);
    },
    deleteCompany: (_parent: unknown, { id }: { id: string }) => {
      return deleteCompany(id);
    },
  },
};
