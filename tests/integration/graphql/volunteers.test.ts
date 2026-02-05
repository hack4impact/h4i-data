import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { env } from '../../../src/config/server';

let server: Server;
let app: express.Application;
let constituentId: string;
let volunteerId: string;

beforeAll(async () => {
  app = createGraphqlApp();
  server = app.listen(env.GRAPHQL_PORT);

  // Create a constituent first (required for volunteer)
  const constituentMutation = `
    mutation CreateConstituent($input: CreateConstituentInput!) {
      createConstituent(input: $input) {
        constituent_id
        first_name
        last_name
        primary_email
      }
    }
  `;

  const uniqueEmail = `test.volunteer.${Date.now()}@example.com`;
  const constituentVariables = {
    input: {
      first_name: 'John',
      last_name: 'Doe',
      primary_email: uniqueEmail,
    },
  };

  const constituentResponse = await request(server)
    .post('/')
    .send({ query: constituentMutation, variables: constituentVariables });

  constituentId =
    constituentResponse.body.data.createConstituent.constituent_id;
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
          org_email
          active_status
          volunteer_class
          engagement_track
          major
          education_level
        }
      }
    `;
    const variables = {
      input: {
        volunteer_id: constituentId,
        org_email: 'john@org.edu',
        active_status: true,
        volunteer_class: 'COLLEGIATE',
        engagement_track: 'PROGRAMS',
        major: 'Computer Science',
        education_level: 'UNDERGRADUATE',
      },
    };

    const response = await request(server)
      .post('/')
      .send({ query: mutation, variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const volunteer = response.body.data.createVolunteer;
    expect(volunteer).toHaveProperty('volunteer_id');
    expect(volunteer.volunteer_id).toBe(constituentId);
    expect(volunteer.org_email).toBe('john@org.edu');

    volunteerId = volunteer.volunteer_id;
  });

  it('should fetch a volunteer by their ID via query', async () => {
    const query = `
      query Volunteer($id: ID!) {
        volunteer(id: $id) {
          volunteer_id
          org_email
          active_status
          volunteer_class
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
    expect(volunteer.org_email).toBe('john@org.edu');
  });

  it('should fetch all volunteers', async () => {
    const query = `
      query {
        volunteers {
          volunteer_id
          org_email
          active_status
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
        volunteer(id: "00000000-0000-0000-0000-000000000000") {
          volunteer_id
          org_email
        }
      }
    `;

    const response = await request(server).get('/').send({ query });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.data.volunteer).toBeNull();
    expect(response.body.errors).toBeDefined();
  });

  it('should update a volunteer', async () => {
    const updateMutation = `
      mutation UpdateVolunteer($id: ID!, $input: UpdateVolunteerInput!) {
        updateVolunteer(id: $id, input: $input) {
          volunteer_id
          org_email
          active_status
          major
        }
      }
    `;

    const updateVariables = {
      id: volunteerId,
      input: {
        active_status: false,
        major: 'Software Engineering',
      },
    };

    const updateResponse = await request(server)
      .post('/')
      .send({ query: updateMutation, variables: updateVariables });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.errors).toBeUndefined();
    const updatedVolunteer = updateResponse.body.data.updateVolunteer;
    expect(updatedVolunteer.volunteer_id).toBe(volunteerId);
    expect(updatedVolunteer.active_status).toBe(false);
    expect(updatedVolunteer.major).toBe('Software Engineering');
  });

  it('should delete a volunteer', async () => {
    const deleteMutation = `
      mutation DeleteVolunteer($id: ID!) {
        deleteVolunteer(id: $id) {
          volunteer_id
        }
      }
    `;
    const deleteVariables = { id: volunteerId };
    const deleteResponse = await request(server)
      .post('/')
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
