import {
  createCompany,
  createCompanySchema,
  deleteCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  updateCompanySchema,
} from '../../../core';
import { z } from 'zod';

type CreateCompanyInput = z.infer<typeof createCompanySchema>;
type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export const companyResolvers = {
  Query: {
    companies: () => getAllCompanies(),
    company: (_parent: unknown, { id }: { id: string }) => {
      return getCompanyById(id);
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
