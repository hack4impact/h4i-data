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

describe('GraphQL API - Nonprofits', () => {
  it('should create a new nonprofit via mutation', async () => {
    const mutation = `
      mutation CreateNonprofit($input: CreateNonprofitInput!) {
        createNonprofit(input: $input) {
          nonprofit_id
          name
          mission
          website
          location_id
          contact_id
        }
      }
    `;
    const variables = {
      input: {
        name: 'GraphQL Integration Test Nonprofit',
        mission: 'This is a test mission for nonprofit',
        website: 'https://example.org',              // must be a valid URL
        // location_id is optional; include only if you want
        // location_id: '0d0f34a1-3f6f-4f7f-8a9e-0e1a2b3c4d5e',
        contact_id: 'e9ded8b8-53e3-4747-aafa-d662458c2a65',
      },
    };

    const response = await request(server)
      .post('/')
      .send({ query: mutation, variables });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const nonprofit = response.body.data.createNonprofit;
    expect(nonprofit).toHaveProperty('nonprofit_id');
    expect(nonprofit.name).toBe('GraphQL Integration Test Nonprofit');
  });

  it('should create and fetch a nonprofit by its ID via query', async () => {
    const createMutation = `
      mutation CreateNonprofit($input: CreateNonprofitInput!) {
        createNonprofit(input: $input) {
          nonprofit_id
          name
          mission
          website
          location_id
          contact_id
        }
      }
    `;
    const createVariables = {
      input: {
        name: 'Test Nonprofit for Query',
        mission: 'This is a test query mission for nonprofit',
        website: 'https://example.com',              // valid URL
        // location_id: '0d0f34a1-3f6f-4f7f-8a9e-0e1a2b3c4d5e',
        contact_id: 'e9ded8b8-53e3-4747-aafa-d662458c2a65',
      },
    };

    const createResponse = await request(server)
      .post('/')
      .send({ query: createMutation, variables: createVariables });

    expect(createResponse.status).toBe(200);
    expect(createResponse.body.errors).toBeUndefined();
    const nonprofitId = createResponse.body.data.createNonprofit.nonprofit_id;

    const query = `
      query Nonprofit($id: ID!) {
        nonprofit(id: $id) {
          nonprofit_id
          name
          mission
          website
          location_id
          contact_id
        }
      }
    `;
    const variables = { id: nonprofitId };

    const response = await request(server).post('/').send({ query, variables });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const nonprofit = response.body.data.nonprofit;
    expect(nonprofit.nonprofit_id).toBe(nonprofitId);
    expect(nonprofit.name).toBe('Test Nonprofit for Query');
  });
});
