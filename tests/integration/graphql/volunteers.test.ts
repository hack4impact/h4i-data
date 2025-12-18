import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { env } from '../../../src/config/server';

let server: Server;
let app: express.Application;
let universityId: string;
let volunteerId: string;

beforeAll(async () => {
  app = createGraphqlApp();
  server = app.listen(env.GRAPHQL_PORT);

  // create a university location and get its id
  const universityMutation = `
    mutation CreateLocation($input: CreateLocationInput!) {
      createLocation(input: $input) {
        location_id
        name
        address
        country_code
        subdivision_code
      }
    }
  `;

  const universityVariables = {
    input: {
      name: 'Test Location ',
      address: '123 Test St',
      country_code: 'US',
      subdivision_code: 'NY',
    },
  };

  const universityResponse = await request(server)
    .post('/') // GraphQL server is at the root
    .send({ query: universityMutation, variables: universityVariables });

  universityId = universityResponse.body.data.createLocation.location_id;
});

afterAll(() => {
  server.close();
});

describe('GraphQL API - Volunteers', () => {
  it('should create a new volunteer via mutation', async () => {
    const mutation = `
      mutation CreateVolunteer($input: CreateVolunteerInput!) {
        createVolunteer(input: $input) {
          volunteer_id
          first_name
          last_name
          email
          graduation_date
          university_id
          volunteer_status
          volunteer_type
          h4i_email
          chapter_id
          company_id
        }
      }
    `;
    const variables = {
      input: {
        first_name: 'John',
        last_name: 'Doe',
        email:
          'john.doe' +
          Date.now() +
          Math.floor(Math.random() * 1000) +
          '@example.com',
        graduation_date: new Date('2026-06-18').toISOString(),
        volunteer_status: 'STUDENT',
        volunteer_type: 'BOTH',
        university_id: universityId, // Test UUID from Supabase
      },
    };

    const response = await request(server)
      .post('/') // GraphQL server is at the root
      .send({ query: mutation, variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const volunteer = response.body.data.createVolunteer;
    expect(volunteer).toHaveProperty('volunteer_id');
    expect(volunteer.first_name).toBe('John');

    volunteerId = volunteer.volunteer_id;
  });

  it('should fetch a volunteer by their ID via query', async () => {
    // Now fetch it
    const query = `
      query Volunteer($id: ID!) {
        volunteer(id: $id) {
          volunteer_id
          first_name
          last_name
          email
          volunteer_status
        }
      }
    `;
    const variables = { id: volunteerId };

    const response = await request(server).post('/').send({ query, variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const volunteer = response.body.data.volunteer;
    expect(volunteer.volunteer_id).toBe(volunteerId);
    expect(volunteer.first_name).toBe('John');
  });

  it('should fetch all volunteers', async () => {
    // Now fetch it
    const query = `
      query {
        volunteers {
          volunteer_id
          first_name
          last_name
          email
          volunteer_status
        }
      }
    `;

    const response = await request(server).get('/').send({ query });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const volunteers = response.body.data.volunteers;
    expect(Array.isArray(volunteers)).toBe(true);
  });
  it("should provide an error if volunteer doesn't exist", async () => {
    const query = `
      query {
        volunteer(id: "non-existent-id") {
          volunteer_id
          first_name
        }
      }
    `;

    const response = await request(server).get('/').send({ query });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.data.volunteer).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toMatch(
      /Database error: Failed to retrieve volunteer/
    );
  });

  it('should update a new volunteer', async () => {
    // Now update the volunteer
    const updateMutation = `
      mutation UpdateVolunteer($id: ID!, $input: UpdateVolunteerInput!) {
        updateVolunteer(id: $id, input: $input) {
          volunteer_id
          first_name
          last_name
        }
      }
    `;

    const updateVariables = {
      id: volunteerId,
      input: {
        first_name: 'New Updated John',
        last_name: 'New Updated Smith',
      },
    };

    const updateResponse = await request(server)
      .post('/') // GraphQL server is at the root
      .send({ query: updateMutation, variables: updateVariables });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.errors).toBeUndefined();
    const updatedVolunteer = updateResponse.body.data.updateVolunteer;
    expect(updatedVolunteer.volunteer_id).toBe(volunteerId);
    expect(updatedVolunteer.first_name).toBe('New Updated John');
    expect(updatedVolunteer.last_name).toBe('New Updated Smith');
  });

  it('should delete a volunteer', async () => {
    // Now delete the volunteer
    const deleteMutation = `
      mutation DeleteVolunteer($id: ID!) {
        deleteVolunteer(id: $id) {
          volunteer_id
        }
      }
    `;
    const deleteVariables = { id: volunteerId };
    const deleteResponse = await request(server)
      .post('/') // GraphQL server is at the root
      .send({ query: deleteMutation, variables: deleteVariables });

    // Assertions
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.errors).toBeUndefined();
    expect(deleteResponse.body.data.deleteVolunteer).toHaveProperty(
      'volunteer_id',
      volunteerId
    );
  });
});
