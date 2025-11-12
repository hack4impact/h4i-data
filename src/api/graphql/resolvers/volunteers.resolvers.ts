import { GraphQLError } from 'graphql';
import { z } from 'zod';
import {
  createVolunteer,
  createVolunteerSchema,
  deleteVolunteer,
  getVolunteerById,
  updateVolunteer,
  updateVolunteerSchema,
} from '../../../core';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

type CreateVolunteerInput = z.infer<typeof createVolunteerSchema>;
type UpdateVolunteerInput = z.infer<typeof updateVolunteerSchema>;

type VolunteerFilterInput = {
  chapters?: string[]; // chapter names
  roles?: string[]; // role
  statuses?: string[]; // volunteer statuses
};

export const volunteerResolvers = {
  Query: {
    volunteers: async (
      _parent: unknown,
      args: {
        filter?: VolunteerFilterInput;
        limit?: number;
        offset?: number;
      }
    ) => {
      const { filter, limit = 50, offset = 0 } = args;

      const where: any = {};

      // status filter
      if (filter?.statuses?.length) {
        where.volunteer_status = { in: filter.statuses };
      }

      // chapter filter via chapters
      if (filter?.chapters?.length) {
        where.chapters = { name: { in: filter.chapters } };
      }

      // role filter via volunteers
      if (filter?.roles?.length) {
        where.volunteer_assignment = {
          some: {
            roles: {
              name: { in: filter.roles },
            },
          },
        };
      }

      const [nodes, totalCount] = await Promise.all([
        prisma.volunteers.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: [{ last_name: 'asc' }, { first_name: 'asc' }],
          include: {
            chapters: true,
            companies: true,
            volunteer_assignment: {
              include: {
                roles: true,
                national_branches: true,
              },
            },
          },
        }),
        prisma.volunteers.count({ where }),
      ]);

      return { nodes, totalCount };
    },

    volunteer: async (_parent: unknown, { id }: { id: string }) => {
      const volunteer = await getVolunteerById(id);
      if (!volunteer) {
        throw new GraphQLError(
          'Volunteer not found',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          {
            code: 'NOT_FOUND',
          }
        );
      }
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
