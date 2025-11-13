// src/api/graphql/resolvers/volunteers.resolvers.ts

import { z } from 'zod';
import {
  createVolunteer,
  createVolunteerSchema,
  deleteVolunteer,
  getVolunteerById,
  updateVolunteer,
  updateVolunteerSchema,
} from '../../../core';
import {
  PrismaClient,
  Prisma,
  volunteer_status as VStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

type CreateVolunteerInput = z.infer<typeof createVolunteerSchema>;
type UpdateVolunteerInput = z.infer<typeof updateVolunteerSchema>;

export interface VolunteerFilterInput {
  chapters?: string[];
  roles?: string[];
  statuses?: (import('@prisma/client').volunteer_status | string)[];
}

export const volunteerResolvers = {
  Query: {
    // GraphQL:
    // volunteers(filter, limit, offset): [Volunteer!]!
    volunteers: async (
      _parent: unknown,
      args: {
        filter?: VolunteerFilterInput;
        limit?: number;
        offset?: number;
      }
    ) => {
      const { filter, limit = 50, offset = 0 } = args;

      const where: Prisma.volunteersWhereInput = {};

      // status filter
      if (filter?.statuses?.length) {
        const statuses = filter.statuses
          .map((s) => (typeof s === 'string' ? s.toUpperCase() : s))
          .filter((s): s is VStatus => s === 'STUDENT' || s === 'PROFESSIONAL');

        if (statuses.length) {
          where.volunteer_status = { in: statuses };
        }
      }

      // chapter filter via related chapters model
      if (filter?.chapters?.length) {
        where.chapters = {
          is: {
            name: { in: filter.chapters },
          },
        };
      }

      // role filter via volunteer_assignment → roles
      if (filter?.roles?.length) {
        where.volunteer_assignment = {
          some: {
            roles: {
              name: { in: filter.roles },
            },
          },
        };
      }

      // Tests expect an array of volunteers here
      return prisma.volunteers.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: [{ last_name: 'asc' }, { first_name: 'asc' }],
      });
    },

    // GraphQL: volunteer(id: ID!): Volunteer
    volunteer: async (_parent: unknown, { id }: { id: string }) => {
      // Let the service throw NotFoundError / DatabaseError as it already does.
      // GraphQL will surface the error message in `errors[0].message`.
      const volunteer = await getVolunteerById(id);
      return volunteer;
    },
  },

  Mutation: {
    createVolunteer: (
      _parent: unknown,
      { input }: { input: CreateVolunteerInput }
    ) => {
      const validatedInput = createVolunteerSchema.parse(input);
      return createVolunteer(validatedInput);
    },
    updateVolunteer: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateVolunteerInput }
    ) => {
      const validatedInput = updateVolunteerSchema.parse(input);
      return updateVolunteer(id, validatedInput);
    },
    deleteVolunteer: (_parent: unknown, { id }: { id: string }) => {
      return deleteVolunteer(id);
    },
  },
};
