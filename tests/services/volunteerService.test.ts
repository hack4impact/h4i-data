import { volunteerService } from "../../src/services/volunteerService";
import { VolunteerStatus, VolunteerType } from "../../src/types";

// Mock Prisma client
jest.mock("../../src/config/database", () => ({
  prisma: {
    volunteers: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { prisma } from "../../src/config/database";

describe("VolunteerService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createVolunteer", () => {
    it("should create a volunteer successfully", async () => {
      const mockVolunteerData = {
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        graduation_date: new Date("2025-06-15"),
        volunteer_status: VolunteerStatus.STUDENT,
        H4I_email: "john@hack4impact.org",
        volunteer_type: VolunteerType.CHAPTER,
        university_id: "123e4567-e89b-12d3-a456-426614174000",
      };

      const mockCreatedVolunteer = {
        volunteer_id: "123e4567-e89b-12d3-a456-426614174001",
        ...mockVolunteerData,
      };

      (prisma.volunteers.create as jest.Mock).mockResolvedValue(
        mockCreatedVolunteer,
      );

      const result = await volunteerService.createVolunteer(mockVolunteerData);

      expect(result).toBe("Successfully created volunteer!");
      expect(prisma.volunteers.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          first_name: mockVolunteerData.first_name,
          last_name: mockVolunteerData.last_name,
          email: mockVolunteerData.email,
          volunteer_status: mockVolunteerData.volunteer_status,
          volunteer_type: mockVolunteerData.volunteer_type,
        }),
      });
    });

    it("should throw an error when creation fails", async () => {
      const mockVolunteerData = {
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        graduation_date: new Date("2025-06-15"),
        volunteer_status: VolunteerStatus.STUDENT,
        volunteer_type: VolunteerType.CHAPTER,
        university_id: "123e4567-e89b-12d3-a456-426614174000",
      };

      (prisma.volunteers.create as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        volunteerService.createVolunteer(mockVolunteerData),
      ).rejects.toThrow("Failed to create volunteer");
    });
  });

  describe("getAllVolunteers", () => {
    it("should return all volunteers", async () => {
      const mockVolunteers = [
        {
          volunteer_id: "123e4567-e89b-12d3-a456-426614174001",
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
          graduation_date: new Date("2025-06-15"),
          volunteer_status: VolunteerStatus.STUDENT,
          volunteer_type: VolunteerType.CHAPTER,
        },
        {
          volunteer_id: "123e4567-e89b-12d3-a456-426614174002",
          first_name: "Jane",
          last_name: "Smith",
          email: "jane.smith@example.com",
          graduation_date: new Date("2024-12-15"),
          volunteer_status: VolunteerStatus.PROFESSIONAL,
          volunteer_type: VolunteerType.NATIONALS,
        },
      ];

      (prisma.volunteers.findMany as jest.Mock).mockResolvedValue(
        mockVolunteers,
      );

      const result = await volunteerService.getAllVolunteers();

      expect(result).toHaveLength(2);
      expect(result[0].volunteer_id).toBe(
        "123e4567-e89b-12d3-a456-426614174001",
      );
      expect(result[1].volunteer_id).toBe(
        "123e4567-e89b-12d3-a456-426614174002",
      );
      expect(prisma.volunteers.findMany).toHaveBeenCalledWith();
    });

    it("should throw an error when fetching fails", async () => {
      (prisma.volunteers.findMany as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await expect(volunteerService.getAllVolunteers()).rejects.toThrow(
        "Failed to fetch volunteers",
      );
    });
  });

  describe("getVolunteerById", () => {
    it("should return a volunteer by ID", async () => {
      const mockVolunteer = {
        volunteer_id: "123e4567-e89b-12d3-a456-426614174001",
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        graduation_date: new Date("2025-06-15"),
        volunteer_status: VolunteerStatus.STUDENT,
        volunteer_type: VolunteerType.CHAPTER,
      };

      (prisma.volunteers.findUnique as jest.Mock).mockResolvedValue(
        mockVolunteer,
      );

      const result = await volunteerService.getVolunteerById(
        "123e4567-e89b-12d3-a456-426614174001",
      );

      expect(result).toEqual(
        expect.objectContaining({
          volunteer_id: "123e4567-e89b-12d3-a456-426614174001",
          first_name: "John",
          last_name: "Doe",
        }),
      );
      expect(prisma.volunteers.findUnique).toHaveBeenCalledWith({
        where: { volunteer_id: "123e4567-e89b-12d3-a456-426614174001" },
      });
    });

    it("should return null when volunteer not found", async () => {
      (prisma.volunteers.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await volunteerService.getVolunteerById("nonexistent-id");

      expect(result).toBeNull();
    });
  });

  describe("deleteVolunteer", () => {
    it("should delete a volunteer successfully", async () => {
      const mockDeletedVolunteer = {
        volunteer_id: "123e4567-e89b-12d3-a456-426614174001",
        first_name: "John",
        last_name: "Doe",
      };

      (prisma.volunteers.delete as jest.Mock).mockResolvedValue(
        mockDeletedVolunteer,
      );

      const result = await volunteerService.deleteVolunteer(
        "123e4567-e89b-12d3-a456-426614174001",
      );

      expect(result).toBe("Successfully deleted volunteer!");
      expect(prisma.volunteers.delete).toHaveBeenCalledWith({
        where: { volunteer_id: "123e4567-e89b-12d3-a456-426614174001" },
      });
    });
  });
});
