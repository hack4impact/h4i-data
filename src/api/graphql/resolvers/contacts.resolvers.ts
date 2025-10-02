import {
  createContact,
  createContactSchema,
  deleteContact,
  getAllContacts,
  getContactById,
  updateContact,
  updateContactSchema,
} from '../../../core';
import { GraphQLError } from 'graphql';
import { z } from 'zod';

// Infer TypeScript types directly from your Zod schemas
type CreateContactInput = z.infer<typeof createContactSchema>;
type UpdateContactInput = z.infer<typeof updateContactSchema>;

export const contactResolvers = {
  Query: {
    contacts: () => getAllContacts(),
    contact: async (_parent: unknown, { id }: { id: string }) => {
      const contact = await getContactById(id);
      if (!contact) {
        throw new GraphQLError(
          'Contact not found',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          { code: 'NOT_FOUND' }
        );
      }
      return contact;
    },
  },
  Mutation: {
    createContact: (
      _parent: unknown,
      { input }: { input: CreateContactInput }
    ) => {
      const validatedInput = createContactSchema.parse(input);
      return createContact(validatedInput);
    },
    updateContact: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateContactInput }
    ) => {
      const validatedInput = updateContactSchema.parse(input);
      return updateContact(id, validatedInput);
    },
    deleteContact: (_parent: unknown, { id }: { id: string }) => {
      return deleteContact(id);
    },
  },
};
