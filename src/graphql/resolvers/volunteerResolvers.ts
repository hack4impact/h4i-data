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
      return await volunteerService.getAllVolunteers(); // ← Service call!
    },
  },
  Mutation: {
    createVolunteer: async (_: any, { input }: { input: VolunteerInput }) => {
      return await volunteerService.createVolunteer(input); // ← Service call!
    },
  },
};
