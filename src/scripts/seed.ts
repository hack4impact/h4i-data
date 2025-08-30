import { connectToDB, disconnectFromDB } from '../config/database';
import { volunteerService } from '../services';
import { VolunteerStatus, VolunteerType } from '../types';

const sampleVolunteers = [
  {
    first_name: 'Sophia',
    last_name: 'Chang',
    email: 'sophia@test.com',
    graduation_date: new Date('2026-06-18'),
    volunteer_status: VolunteerStatus.STUDENT,
    H4I_email: 'sophia@hack4impact.org',
    volunteer_type: VolunteerType.CHAPTER,
    university_id: '860b69b4-a14e-41d9-a367-2632b342e549',
  },
  {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@test.com',
    graduation_date: new Date('2024-05-15'),
    volunteer_status: VolunteerStatus.PROFESSIONAL,
    H4I_email: 'john@hack4impact.org',
    volunteer_type: VolunteerType.NATIONALS,
    university_id: '860b69b4-a14e-41d9-a367-2632b342e549',
  },
];

async function seedData() {
  try {
    console.log('Starting data seeding...');
    await connectToDB();

    for (const volunteerData of sampleVolunteers) {
      try {
        await volunteerService.createVolunteer(volunteerData);
        console.log(
          `✓ Created volunteer: ${volunteerData.first_name}  ${volunteerData.last_name}`
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes('already  exists')
        ) {
          console.log(
            `- Volunteer already exists: ${volunteerData.first_name} ${volunteerData.last_name}`
          );
        } else {
          console.error(
            `✗ Failed to create volunteer 
  ${volunteerData.first_name}:`,
            error
          );
        }
      }
    }

    console.log('Data seeding completed successfully');
  } catch (error) {
    console.error('Failed to seed data:', error);
    process.exit(1);
  } finally {
    await disconnectFromDB();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

export { seedData };
