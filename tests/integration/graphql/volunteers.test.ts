import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { env } from '../../../src/config/server';

let server: Server;
let app: express.Application;

beforeAll(() => {
  app = createGraphqlApp();
  server = app.listen(env.GRAPHQL_PORT);
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
        university_id: '07608837-420f-4697-bda2-701506079a9d', // Test UUID from Supabase
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
  });

  it('should create and fetch a volunteer by their ID via query', async () => {
    // Create a volunteer for this specific test
    const createMutation = `
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
        }
      }
    `;
    const createVariables = {
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
        university_id: '07608837-420f-4697-bda2-701506079a9d', // Test UUID from Supabase
      },
    };

    const createResponse = await request(server)
      .post('/')
      .send({ query: createMutation, variables: createVariables });

    expect(createResponse.status).toBe(200);
    expect(createResponse.body.errors).toBeUndefined();
    const volunteerId = createResponse.body.data.createVolunteer.volunteer_id;

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
        university_id: '07608837-420f-4697-bda2-701506079a9d', // Test UUID from Supabase
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
      id: volunteer.volunteer_id,
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
    expect(updatedVolunteer.volunteer_id).toBe(volunteer.volunteer_id);
    expect(updatedVolunteer.first_name).toBe('New Updated John');
    expect(updatedVolunteer.last_name).toBe('New Updated Smith');
  });

  it('should delete a volunteer', async () => {
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
        university_id: '07608837-420f-4697-bda2-701506079a9d', // Test UUID from Supabase
      },
    };
    const response = await request(server)
      .post('/') // GraphQL server is at the root
      .send({ query: mutation, variables });

    // Get the created volunteer's ID
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const volunteer = response.body.data.createVolunteer;
    expect(volunteer).toHaveProperty('volunteer_id');
    const volunteerId = volunteer.volunteer_id;
    console.log(volunteerId, 'is the id of the volunteer');

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
