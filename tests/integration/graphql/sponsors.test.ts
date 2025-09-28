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

describe('GraphQL API - Sponsors', () => {
  it('should create a new sponsor via mutation', async () => {
    const mutation = `
      mutation CreateSponsor($input: CreateSponsorInput!) {
        createSponsor(input: $input) {
          sponsor_id
          name
          contact_id
        }
      }
    `;
    const variables = {
      input: {
        name: 'GraphQL Integration Test Sponsor',
        contact_id: 'e9ded8b8-53e3-4747-aafa-d662458c2a65', // Example UUID
      },
    };

    const response = await request(server)
      .post('/')
      .send({ query: mutation, variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const sponsor = response.body.data.createSponsor;
    expect(sponsor).toHaveProperty('sponsor_id');
    expect(sponsor.name).toBe('GraphQL Integration Test Sponsor');
  });

  it('should create and fetch a sponsor by its ID via query', async () => {
    // Create a sponsor for this specific test
    const createMutation = `
      mutation CreateSponsor($input: CreateSponsorInput!) {
        createSponsor(input: $input) {
          sponsor_id
          name
          contact_id
        }
      }
    `;
    const createVariables = {
      input: {
        name: 'Test Sponsor for Query',
        contact_id: 'e9ded8b8-53e3-4747-aafa-d662458c2a65',
      },
    };

    const createResponse = await request(server)
      .post('/')
      .send({ query: createMutation, variables: createVariables });

    expect(createResponse.status).toBe(200);
    expect(createResponse.body.errors).toBeUndefined();
    const sponsorId = createResponse.body.data.createSponsor.sponsor_id;

    // Now fetch it
    const query = `
      query Sponsor($id: ID!) {
        sponsor(id: $id) {
          sponsor_id
          name
        }
      }
    `;
    const variables = { id: sponsorId };

    const response = await request(server).post('/').send({ query, variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const sponsor = response.body.data.sponsor;
    expect(sponsor.sponsor_id).toBe(sponsorId);
    expect(sponsor.name).toBe('Test Sponsor for Query');
  });
});
