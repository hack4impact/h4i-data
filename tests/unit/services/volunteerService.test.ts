import { volunteerService } from "../../../src/services/volunteerService";
import { prisma } from "../../../src/config/database";

// Mock the database
jest.mock("../../../src/config/database", () => ({
  prisma: {
    volunteers: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// new unit test template
// describe('newFunction', () => {
//   it('should do something', async () => {
//     // arrange
//     const mockData = { /* mock data */ };
//     (prisma.volunteers.someOperation as jest.Mock).mockResolvedValue(mockData);
//
//     // act
//     const result = await volunteerService.newFunction('param');
//
//     // assert
//     expect(result).toEqual(mockData);
//     expect(prisma.volunteers.someOperation).toHaveBeenCalledWith(/* expected params */);
//   });
// });

describe("VolunteerService", () => {
  it("should get all volunteers", async () => {
    // Arrange
    const mockVolunteers = [{ id: "1", first_name: "John" }];
    (prisma.volunteers.findMany as jest.Mock).mockResolvedValue(mockVolunteers);

    // Act
    const result = await volunteerService.getAllVolunteers();

    // Assert
    expect(result).toEqual(mockVolunteers);
    expect(prisma.volunteers.findMany).toHaveBeenCalled();
  });
});
