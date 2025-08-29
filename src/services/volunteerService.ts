import { Prisma } from "../../generated/prisma";
import { prisma } from "../config/database";
import { Volunteer, VolunteerInput, VolunteerUpdateInput } from "../types";

export class VolunteerService {
  // Create a new volunteer
  async createVolunteer(volunteerData: VolunteerInput): Promise<string> {
    try {
      const newVolunteer = await prisma.volunteers.create({
        data: {
          first_name: volunteerData.first_name,
          last_name: volunteerData.last_name,
          email: volunteerData.email,
          graduation_date: new Date(volunteerData.graduation_date),
          volunteer_status: volunteerData.volunteer_status,
          H4I_email: volunteerData.H4I_email,
          volunteer_type: volunteerData.volunteer_type,
          university_id: volunteerData.university_id,
        } as Prisma.volunteersUncheckedCreateInput,
      });

      console.log(`Created Volunteer: 
        id: ${newVolunteer.volunteer_id}
        name: ${newVolunteer.first_name} ${newVolunteer.last_name}
        email: ${newVolunteer.email}
        graduation_date: ${newVolunteer.graduation_date}
        volunteer_status: ${newVolunteer.volunteer_status}
        H4I_email: ${newVolunteer.H4I_email}
        volunteer_type: ${newVolunteer.volunteer_type}`);

      return "Successfully created volunteer!";
    } catch (error) {
      console.error("Volunteer creation error:", error);
      throw new Error("Failed to create volunteer");
    }
  }

  // Get all volunteers
  async getAllVolunteers(): Promise<Volunteer[]> {
    try {
      const volunteers = await prisma.volunteers.findMany();
      return volunteers.map((volunteer) => ({
        ...volunteer,
        volunteer_id: volunteer.volunteer_id.toString(),
      }));
    } catch (error) {
      console.error("Get all volunteers error:", error);
      throw new Error("Failed to fetch volunteers");
    }
  }

  // Get volunteer by ID
  async getVolunteerById(id: string): Promise<Volunteer | null> {
    try {
      const volunteer = await prisma.volunteers.findUnique({
        where: { volunteer_id: id },
      });

      if (!volunteer) {
        return null;
      }

      return {
        ...volunteer,
        volunteer_id: volunteer.volunteer_id.toString(),
      };
    } catch (error) {
      console.error("Get volunteer by ID error:", error);
      throw new Error("Failed to fetch volunteer");
    }
  }

  // Update volunteer
  async updateVolunteer(
    id: string,
    updateData: VolunteerUpdateInput,
  ): Promise<string> {
    try {
      const updatedVolunteer = await prisma.volunteers.update({
        where: { volunteer_id: id },
        data: {
          ...updateData,
          graduation_date: updateData.graduation_date
            ? new Date(updateData.graduation_date)
            : undefined,
        },
      });

      console.log(`Updated Volunteer: ${updatedVolunteer.volunteer_id}`);
      return "Successfully updated volunteer!";
    } catch (error) {
      console.error("Volunteer update error:", error);
      throw new Error("Failed to update volunteer");
    }
  }

  // Delete volunteer
  async deleteVolunteer(id: string): Promise<string> {
    try {
      const deletedVolunteer = await prisma.volunteers.delete({
        where: { volunteer_id: id },
      });

      console.log(`Deleted Volunteer: ${deletedVolunteer.volunteer_id}`);
      return "Successfully deleted volunteer!";
    } catch (error) {
      console.error("Volunteer deletion error:", error);
      throw new Error("Failed to delete volunteer");
    }
  }

  // Get volunteers by status
  async getVolunteersByStatus(status: string): Promise<Volunteer[]> {
    try {
      const volunteers = await prisma.volunteers.findMany({
        where: { volunteer_status: status as any },
      });

      return volunteers.map((volunteer) => ({
        ...volunteer,
        volunteer_id: volunteer.volunteer_id.toString(),
      }));
    } catch (error) {
      console.error("Get volunteers by status error:", error);
      throw new Error("Failed to fetch volunteers by status");
    }
  }

  // Get volunteers by type
  async getVolunteersByType(type: string): Promise<Volunteer[]> {
    try {
      const volunteers = await prisma.volunteers.findMany({
        where: { volunteer_type: type as any },
      });

      return volunteers.map((volunteer) => ({
        ...volunteer,
        volunteer_id: volunteer.volunteer_id.toString(),
      }));
    } catch (error) {
      console.error("Get volunteers by type error:", error);
      throw new Error("Failed to fetch volunteers by type");
    }
  }
}

// Export singleton instance
export const volunteerService = new VolunteerService();
