import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { env } from '../../../src/config/server';

let server: Server;
let app: express.Application;
let locationId: string;

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
          address_line
          state_code
          country_code
        }
      }
    `;

    const variables = {
      input: {
        name: 'Test Location',
        address_line: '123 Test St',
        state_code: 'NY',
        country_code: 'USA',
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
    expect(location.address_line).toBe('123 Test St');
    expect(location.state_code).toBe('NY');
    expect(location.country_code).toBe('USA');

    locationId = location.location_id;
  });

  it('should fetch a location by its ID via query', async () => {
    // Now fetch it using the ID
    const query = `
      query Location($id: ID!) {
        location(id: $id) {
          location_id
          name
          address_line
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
    expect(location.name).toBe('Test Location');
    expect(location.address_line).toBe('123 Test St');
  });

  it('should delete a location by its ID via mutation', async () => {
    const mutation = `
      mutation DeleteLocation($id: ID!) {
        deleteLocation(id: $id) {
          location_id
        }
      }
    `;
    const variables = { id: locationId };

    const response = await request(server)
      .post('/')
      .send({ query: mutation, variables: variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteLocation).toHaveProperty(
      'location_id',
      locationId
    );
  });
});
