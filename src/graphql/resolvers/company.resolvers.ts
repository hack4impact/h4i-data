import {
  createCompany,
  deleteCompany,
  getCompanyById,
  listCompanies,
  updateCompany,
} from '../../../service';

export const companyResolvers = {
  Query: {
    company: (_: unknown, args: { company_id: string }) => {
      return getCompanyById(args.company_id);
    },
    companies: () => {
      return listCompanies();
    },
  },
  Mutation: {
    createCompany: (
      _: unknown,
      args: { input: { name: string; location_id?: string | null } }
    ) => {
      return createCompany(args.input);
    },
    updateCompany: (
      _: unknown,
      args: {
        company_id: string;
        input: { name?: string | null; location_id?: string | null };
      }
    ) => {
      return updateCompany(args.company_id, args.input);
    },
    deleteCompany: (_: unknown, args: { company_id: string }) => {
      return deleteCompany(args.company_id);
    },
  },
};
