import { volunteerService } from "../../services";
import { VolunteerInput, VolunteerUpdateInput } from "../../types";

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

    volunteer: async (_: any, { id }: { id: string }) => {
      return await volunteerService.getVolunteerById(id);
    },
  },

  Mutation: {
    createVolunteer: async (_: any, { input }: { input: VolunteerInput }) => {
      return await volunteerService.createVolunteer(input); // ← Service call!
    },
  },
};
