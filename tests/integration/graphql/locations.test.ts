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

describe('GraphQL API - Locations', () => {
  it('should create a new location via mutation', async () => {
    const mutation = `
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

    const variables = {
      input: {
        name: 'Test Location ',
        address: '123 Test St',
        country_code: 'US',
        subdivision_code: 'NY',
      },
    };

    const response = await request(server)
      .post('/') // GraphQL server is at the root
      .send({ query: mutation, variables: variables });

    // 4. Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const location = response.body.data.createLocation;
    expect(location).toHaveProperty('location_id');
    expect(location.name).toBe(variables.input.name);
    expect(location.address).toBe('123 Test St');
    expect(location.country_code).toBe('US');
    expect(location.subdivision_code).toBe('NY');
  });

  it('should create and fetch a location by its ID via query', async () => {
    // Create a new location first
    const createMutation = `
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

    const createVariables = {
      input: {
        name: 'Fetch Test Location',
        address: '456 Fetch Ave',
        country_code: 'CA',
        subdivision_code: 'ON',
      },
    };

    const createResponse = await request(server)
      .post('/')
      .send({ query: createMutation, variables: createVariables });

    expect(createResponse.status).toBe(200);
    expect(createResponse.body.errors).toBeUndefined();
    const locationId = createResponse.body.data.createLocation.location_id;

    // Now fetch it using the ID
    const query = `
      query Location($id: ID!) {
        location(id: $id) {
          location_id
          name
          address
        }
      }
    `;
    const variables = { id: locationId };

    const response = await request(server)
      .post('/')
      .send({ query: query, variables: variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const location = response.body.data.location;

    // Verify the fetched data matches the created data
    expect(location.location_id).toBe(locationId);
    expect(location.name).toBe('Fetch Test Location');
    expect(location.address).toBe('456 Fetch Ave');
  });
});
