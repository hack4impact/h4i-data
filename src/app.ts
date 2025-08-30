import { startGraphQLServer } from './graphql/server';
import { startRestServer } from './rest/server';
import { connectToDB, disconnectFromDB } from './config/database';
import { volunteerService } from './services';
import { VolunteerStatus, VolunteerType } from './types';

async function seedData() {
  try {
    // Add sample volunteer data
    await volunteerService.createVolunteer({
      first_name: 'Sophia',
      last_name: 'C',
      email: 'test@gmail.com' + Math.floor(Math.random() * 1000).toString(),
      graduation_date: new Date('2026-06-18'),
      volunteer_status: VolunteerStatus.STUDENT,
      H4I_email: 'sophia@hack4impact.org',
      volunteer_type: VolunteerType.CHAPTER,
      university_id: '860b69b4-a14e-41d9-a367-2632b342e549',
    });

    console.log('Sample data seeded successfully');
  } catch (error) {
    console.error('Failed to seed data:', error);
  }
}

async function startBothServers() {
  try {
    console.log('Starting application...');

    // Connect to database once
    await connectToDB();

    // Seed some sample data (optional)
    if (process.env.SEED_DATA === 'true') {
      await seedData();
    }

    // Start both servers concurrently
    const [graphqlServer, restServer] = await Promise.all([
      startGraphQLServer(),
      startRestServer(),
    ]);

    console.log('Both servers started successfully!');
    console.log('GraphQL: http://localhost:3000/graphql');
    console.log('REST API: http://localhost:3001/api');

    // Graceful shutdown for both servers
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received, shutting down gracefully...`);

      try {
        await Promise.all([
          new Promise((resolve) => graphqlServer.close(resolve)),
          new Promise((resolve) => restServer.close(resolve)),
        ]);

        await disconnectFromDB();
        console.log('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start application:', error);
    await disconnectFromDB();
    process.exit(1);
  }
}

// Start the application if this file is run directly
if (require.main === module) {
  startBothServers();
}

export { startBothServers };
