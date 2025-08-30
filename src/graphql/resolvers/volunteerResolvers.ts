import { volunteerService } from '../../services';
import { VolunteerInput } from '../../types';

export const volunteerResolvers = {
  // new graphql resolver template
  // Query: {
  //   newQuery: async (_: any, { param }: { param: string }) => {
  //     return await volunteerService.newFunction(param);
  //   },
  // }

  Query: {
    volunteers: async () => {
      return await volunteerService.getAllVolunteers();
    },

    volunteer: async (_: unknown, { id }: { id: string }) => {
      return await volunteerService.getVolunteerById(id);
    },
  },

  Mutation: {
    createVolunteer: async (
      _: unknown,
      { input }: { input: VolunteerInput }
    ) => {
      return await volunteerService.createVolunteer(input); // ← Service call!
    },
  },
};
