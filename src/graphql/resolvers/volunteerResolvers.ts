import { volunteerService } from "../../services";
import { VolunteerInput, VolunteerUpdateInput } from "../../types";

export const volunteerResolvers = {
  Query: {
    volunteers: async () => {
      return await volunteerService.getAllVolunteers();
    },

    volunteer: async (_: any, { id }: { id: string }) => {
      return await volunteerService.getVolunteerById(id);
    },

    volunteersByStatus: async (_: any, { status }: { status: string }) => {
      return await volunteerService.getVolunteersByStatus(status);
    },

    volunteersByType: async (_: any, { type }: { type: string }) => {
      return await volunteerService.getVolunteersByType(type);
    },
  },

  Mutation: {
    createVolunteer: async (_: any, { input }: { input: VolunteerInput }) => {
      return await volunteerService.createVolunteer(input);
    },

    updateVolunteer: async (
      _: any,
      { id, input }: { id: string; input: VolunteerUpdateInput },
    ) => {
      return await volunteerService.updateVolunteer(id, input);
    },

    deleteVolunteer: async (_: any, { id }: { id: string }) => {
      return await volunteerService.deleteVolunteer(id);
    },
  },
};
