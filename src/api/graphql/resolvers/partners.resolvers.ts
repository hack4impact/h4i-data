import {
  createPartner,
  createPartnerSchema,
  deletePartner,
  getAllPartners,
  getPartnerById,
  updatePartner,
  updatePartnerSchema,
} from '../../../core';
import { NotFoundError } from '../../../middleware/error.middleware';
import { z } from 'zod';

type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;

export const partnerResolvers = {
  Query: {
    partners: () => getAllPartners(),
    partner: async (_parent: unknown, { id }: { id: string }) => {
      try {
        return await getPartnerById(id);
      } catch (error) {
        if (error instanceof NotFoundError) return null;
        throw error;
      }
    },
  },
  Mutation: {
    createPartner: (
      _parent: unknown,
      { input }: { input: CreatePartnerInput }
    ) => {
      const validatedInput = createPartnerSchema.parse(input);
      return createPartner(validatedInput);
    },
    updatePartner: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdatePartnerInput }
    ) => {
      const validatedInput = updatePartnerSchema.parse(input);
      return updatePartner(id, validatedInput);
    },
    deletePartner: (_parent: unknown, { id }: { id: string }) => {
      return deletePartner(id);
    },
  },
};
