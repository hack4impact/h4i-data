import { prisma } from '../config/database';
import { Volunteer, VolunteerInput, VolunteerUpdateInput } from '../types';

export class VolunteerService {
  // new service function template
  // newFunction = async (param: string) => {
  //   try {
  //     // database logic here
  //     return await prisma.volunteers.someOperation();
  //   } catch (error) {
  //     throw new Error('Failed to do something');
  //   }
  // };

  getAllVolunteers = async () => {
    try {
      return await prisma.volunteers.findMany();
    } catch (error) {
      throw new Error('Failed to fetch volunteers');
    }
  };

  createVolunteer = async (data: VolunteerInput) => {
    try {
      return await prisma.volunteers.create({ data });
    } catch (error) {
      throw new Error('Failed to create volunteer');
    }
  };

  getVolunteerById = async (id: string) => {
    try {
      return await prisma.volunteers.findUnique({
        where: { volunteer_id: id },
      });
    } catch (error) {
      throw new Error('Failed to fetch volunteer');
    }
  };
}

// Export singleton instance
export const volunteerService = new VolunteerService();
