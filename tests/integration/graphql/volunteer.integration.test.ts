import request from 'supertest';
import { app } from '../../../src/graphql/server';
import { prisma } from '../../../src/config/database';
import { mockVolunteerData, cleanupTestData } from '../../fixtures/testData';
import { Volunteer } from '../../../src/types';

describe('Volunteer GraphQL Integration', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('createVolunteer mutation', () => {
    it('should create volunteer via GraphQL', async () => {
      const mutation = `
        mutation CreateVolunteer($input: VolunteerInput!) {
          createVolunteer(input: $input) {
            volunteer_id
            first_name
            last_name
            email
            volunteer_status
            volunteer_type
          }
        }
      `;

      const variables = {
        input: {
          first_name: 'GraphQL',
          last_name: 'Test',
          email: 'graphql@test.com',
          graduation_date: '2026-06-15',
          volunteer_status: 'STUDENT',
          H4I_email: 'graphql@hack4impact.org',
          volunteer_type: 'CHAPTER',
          university_id: '860b69b4-a14e-41d9-a367-2632b342e549',
        },
      };

      const response = await request(app)
        .post('/graphql')
        .send({ query: mutation, variables })
        .expect(200);

      // check for graphql errors
      expect(response.body.errors).toBeUndefined();

      // check response data
      expect(response.body.data.createVolunteer.first_name).toBe('GraphQL');
      expect(response.body.data.createVolunteer.email).toBe('graphql@test.com');

      // verify in database
      const dbVolunteer = await prisma.volunteers.findFirst({
        where: { email: 'graphql@test.com' },
      });
      expect(dbVolunteer).not.toBeNull();
      expect(dbVolunteer?.first_name).toBe('GraphQL');
    });

    it('should return error for invalid input', async () => {
      const mutation = `
        mutation CreateVolunteer($input: VolunteerInput!) {
          createVolunteer(input: $input) {
            volunteer_id
          }
        }
      `;

      const variables = {
        input: {
          first_name: '', // empty name should fail
          email: 'invalid-email', // invalid email
        },
      };

      const response = await request(app)
        .post('/graphql')
        .send({ query: mutation, variables })
        .expect(200);

      // should have graphql errors
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('volunteers query', () => {
    it('should fetch all volunteers', async () => {
      // create test volunteers
      await prisma.volunteers.createMany({
        data: [
          mockVolunteerData.validStudent,
          mockVolunteerData.validProfessional,
        ],
      });

      const query = `
        query GetAllVolunteers {
          volunteers {
            volunteer_id
            first_name
            last_name
            volunteer_status
            volunteer_type
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.volunteers).toHaveLength(2);

      // check we got both test volunteers
      const firstNames = response.body.data.volunteers.map(
<<<<<<< HEAD
        (v: Volunteer) => v.first_name
      );
      expect(firstNames).toContain('John');
      expect(firstNames).toContain('Jane');
=======
        (v: any) => v.first_name,
      );
      expect(firstNames).toContain("John");
      expect(firstNames).toContain("Jane");
>>>>>>> b0f3101 (feat: volunteer fix)
    });

    it('should return empty array when no volunteers exist', async () => {
      const query = `
        query GetAllVolunteers {
          volunteers {
            volunteer_id
            first_name
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.volunteers).toHaveLength(0);
    });
  });

  describe('volunteer query (by ID)', () => {
    it('should fetch single volunteer by ID', async () => {
      // create test volunteer
      const volunteer = await prisma.volunteers.create({
        data: mockVolunteerData.validStudent,
      });

      const query = `
        query GetVolunteer($id: ID!) {
          volunteer(id: $id) {
            volunteer_id
            first_name
            last_name
            email
          }
        }
      `;

      const variables = { id: volunteer.volunteer_id };

      const response = await request(app)
        .post('/graphql')
        .send({ query, variables })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.volunteer.volunteer_id).toBe(
        volunteer.volunteer_id
      );
      expect(response.body.data.volunteer.first_name).toBe('John');
    });

    it('should return null for non-existent volunteer', async () => {
      const query = `
        query GetVolunteer($id: ID!) {
          volunteer(id: $id) {
            volunteer_id
            first_name
          }
        }
      `;

      const variables = { id: '999e9999-e99b-99d9-a999-999999999999' };

      const response = await request(app)
        .post('/graphql')
        .send({ query, variables })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.volunteer).toBeNull();
    });
  });
});
