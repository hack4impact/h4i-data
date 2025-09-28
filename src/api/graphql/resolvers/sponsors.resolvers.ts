import {
  createSponsor,
  createSponsorSchema,
  deleteSponsor,
  getAllSponsors,
  getSponsorById,
  updateSponsor,
  updateSponsorSchema,
} from '../../../core';
import { GraphQLError } from 'graphql';
import { z } from 'zod';

// Infer TypeScript types directly from your Zod schemas
type CreateSponsorInput = z.infer<typeof createSponsorSchema>;
type UpdateSponsorInput = z.infer<typeof updateSponsorSchema>;

export const sponsorResolvers = {
  Query: {
    sponsors: () => getAllSponsors(),
    sponsor: async (_parent: unknown, { id }: { id: string }) => {
      const sponsor = await getSponsorById(id);
      if (!sponsor) {
        throw new GraphQLError(
          'Sponsor not found',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          { code: 'NOT_FOUND' }
        );
      }
      return sponsor;
    },
  },
  Mutation: {
    createSponsor: (
      _parent: unknown,
      { input }: { input: CreateSponsorInput }
    ) => {
      const validatedInput = createSponsorSchema.parse(input);
      return createSponsor(validatedInput);
    },
    updateSponsor: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateSponsorInput }
    ) => {
      const validatedInput = updateSponsorSchema.parse(input);
      return updateSponsor(id, validatedInput);
    },
    deleteSponsor: (_parent: unknown, { id }: { id: string }) => {
      return deleteSponsor(id);
    },
  },
};
