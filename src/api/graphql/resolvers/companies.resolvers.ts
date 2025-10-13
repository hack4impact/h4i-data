import {
  createCompany,
  deleteCompany,
  getCompanyById,
  getAllCompanies,
  updateCompany,
} from '../../../core/services/companies.service';

export const companyResolvers = {
  Query: {
    company: (_: unknown, args: { company_id: string }) => {
      return getCompanyById(args.company_id);
    },
    companies: () => {
      return getAllCompanies();
    },
  },
  Mutation: {
    createCompany: (
      _: unknown,
      args: { input: { name: string; location_id?: string | null } }
    ) => {
      const input = {
        name: args.input.name,
        location_id: args.input.location_id || undefined,
      };
      return createCompany(input);
    },
    updateCompany: (
      _: unknown,
      args: {
        company_id: string;
        input: { name?: string | null; location_id?: string | null };
      }
    ) => {
      const input = {
        name: args.input.name || undefined,
        location_id: args.input.location_id || undefined,
      };
      return updateCompany(args.company_id, input);
    },
    deleteCompany: async (_: unknown, args: { company_id: string }) => {
      await deleteCompany(args.company_id);
      return true;
    },
  },
};
