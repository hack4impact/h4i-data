import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

// Helper to create a location for tests
const createTestLocation = async () => {
  const mutation = `
    mutation CreateLocation($input: CreateLocationInput!) {
      createLocation(input: $input) {
        location_id
        name
        address_line
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
  const response = await request(app)
    .post('/')
    .send({ query: mutation, variables });
  return response.body.data.createLocation;
};

describe('GraphQL API - Locations', () => {
  it('should create a new location via mutation', async () => {
    // Act
    const mutation = `
      mutation CreateLocation($input: CreateLocationInput!) {
        createLocation(input: $input) {
          location_id
          name
          address_line
        }
      }
    `;
    const variables = {
      input: {
        name: 'Headquarters',
        address_line: '123 Main Street',
        state_code: 'CA',
        country_code: 'USA',
      },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createLocation).toHaveProperty('location_id');
  });

  it('should fetch a location by its ID via query', async () => {
    // Arrange
    const location = await createTestLocation();

    // Act
    const query = `
      query Location($id: ID!) {
        location(id: $id) {
          location_id
          name
        }
      }
    `;
    const variables = { id: location.location_id };
    const response = await request(app).post('/').send({ query, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.location.location_id).toBe(location.location_id);
  });

  it('should return null for a non-existent location ID', async () => {
    // Act
    const query = `
      query {
        location(id: "00000000-0000-0000-0000-000000000000") {
          location_id
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.location).toBeNull();
  });

  it('should fetch all locations via query', async () => {
    // Arrange
    await createTestLocation();

    // Act
    const query = `query { locations { location_id name } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.locations)).toBe(true);
    expect(response.body.data.locations.length).toBeGreaterThan(0);
  });

  it('should update a location via mutation', async () => {
    // Arrange
    const location = await createTestLocation();

    // Act
    const mutation = `
      mutation UpdateLocation($id: ID!, $input: UpdateLocationInput!) {
        updateLocation(id: $id, input: $input) {
          location_id
          name
        }
      }
    `;
    const variables = {
      id: location.location_id,
      input: { name: 'Updated Location' },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateLocation.name).toBe('Updated Location');
  });

  it('should return errors when updating a non-existent location', async () => {
    // Act
    const mutation = `
      mutation UpdateLocation($id: ID!, $input: UpdateLocationInput!) {
        updateLocation(id: $id, input: $input) {
          location_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: {
          id: '00000000-0000-0000-0000-000000000000',
          input: { name: 'Updated Location' },
        },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return a validation error for an invalid location input', async () => {
    // Arrange
    const location = await createTestLocation();

    // Act
    const mutation = `
      mutation UpdateLocation($id: ID!, $input: UpdateLocationInput!) {
        updateLocation(id: $id, input: $input) {
          location_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: { id: location.location_id, input: { name: 'A' } },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return errors when deleting a non-existent location', async () => {
    // Act
    const mutation = `
      mutation DeleteLocation($id: ID!) {
        deleteLocation(id: $id) {
          location_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: { id: '00000000-0000-0000-0000-000000000000' },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should delete a location by its ID via mutation', async () => {
    // Arrange
    const location = await createTestLocation();

    // Act
    const mutation = `
      mutation DeleteLocation($id: ID!) {
        deleteLocation(id: $id) {
          location_id
        }
      }
    `;
    const variables = { id: location.location_id };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteLocation.location_id).toBe(
      location.location_id
    );

    // Verify deletion
    const verifyQuery = `query { location(id: "${location.location_id}") { location_id } }`;
    const verifyResponse = await request(app)
      .post('/')
      .send({ query: verifyQuery });
    expect(verifyResponse.body.data.location).toBeNull();
  });
});
