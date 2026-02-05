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
    const location = await createTestLocation();

    // Assert
    expect(location).toHaveProperty('location_id');
    expect(location.name).toBe('Test Location');
    expect(location.address_line).toBe('123 Test St');
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
  });
});
