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
});
