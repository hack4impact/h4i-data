import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

const createTestOfficerRole = async (name: string) => {
  const mutation = `
    mutation CreateOfficerRole($input: CreateOfficerRoleInput!) {
      createOfficerRole(input: $input) {
        officer_role_id
        name
      }
    }
  `;
  const response = await request(app)
    .post('/')
    .send({ query: mutation, variables: { input: { name } } });
  return response.body.data.createOfficerRole;
};

describe('GraphQL API - Officer Roles', () => {
  it('should create a new officer role via mutation', async () => {
    // Act
    const mutation = `
      mutation CreateOfficerRole($input: CreateOfficerRoleInput!) {
        createOfficerRole(input: $input) {
          officer_role_id
          name
          scope
        }
      }
    `;
    const variables = {
      input: { name: 'Chapter President', scope: 'CHAPTER', rank_level: 1 },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const role = response.body.data.createOfficerRole;
    expect(role).toHaveProperty('officer_role_id');
    expect(role.name).toBe('Chapter President');
    expect(role.scope).toBe('CHAPTER');
  });

  it('should fetch an officer role by ID via query', async () => {
    // Arrange
    const created = await createTestOfficerRole(
      `Role ${Date.now()}.${Math.random()}`
    );

    // Act
    const query = `
      query OfficerRole($id: ID!) {
        officerRole(id: $id) {
          officer_role_id
          name
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query, variables: { id: created.officer_role_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.officerRole.officer_role_id).toBe(
      created.officer_role_id
    );
  });

  it('should return null for a non-existent officer role ID', async () => {
    // Act
    const query = `
      query {
        officerRole(id: "00000000-0000-0000-0000-000000000000") {
          officer_role_id
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.officerRole).toBeNull();
  });

  it('should fetch all officer roles via query', async () => {
    // Arrange
    await createTestOfficerRole(`Role ${Date.now()}.${Math.random()}`);

    // Act
    const query = `query { officerRoles { officer_role_id name } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.officerRoles)).toBe(true);
    expect(response.body.data.officerRoles.length).toBeGreaterThan(0);
  });

  it('should update an officer role via mutation', async () => {
    // Arrange
    const created = await createTestOfficerRole(
      `Role ${Date.now()}.${Math.random()}`
    );

    // Act
    const mutation = `
      mutation UpdateOfficerRole($id: ID!, $input: UpdateOfficerRoleInput!) {
        updateOfficerRole(id: $id, input: $input) {
          officer_role_id
          name
          scope
        }
      }
    `;
    const variables = {
      id: created.officer_role_id,
      input: { name: 'Updated Role', scope: 'CENTRAL' },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateOfficerRole.name).toBe('Updated Role');
    expect(response.body.data.updateOfficerRole.scope).toBe('CENTRAL');
  });

  it('should return errors when updating a non-existent officer role', async () => {
    // Act
    const mutation = `
      mutation UpdateOfficerRole($id: ID!, $input: UpdateOfficerRoleInput!) {
        updateOfficerRole(id: $id, input: $input) {
          officer_role_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: {
          id: '00000000-0000-0000-0000-000000000000',
          input: { name: 'Updated Role' },
        },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return a validation error for an invalid officer role input', async () => {
    // Arrange
    const created = await createTestOfficerRole(
      `Role ${Date.now()}.${Math.random()}`
    );

    // Act
    const mutation = `
      mutation UpdateOfficerRole($id: ID!, $input: UpdateOfficerRoleInput!) {
        updateOfficerRole(id: $id, input: $input) {
          officer_role_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: { id: created.officer_role_id, input: { name: 'X' } },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return errors when deleting a non-existent officer role', async () => {
    // Act
    const mutation = `
      mutation DeleteOfficerRole($id: ID!) {
        deleteOfficerRole(id: $id) {
          officer_role_id
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

  it('should delete an officer role via mutation', async () => {
    // Arrange
    const created = await createTestOfficerRole(
      `Role ${Date.now()}.${Math.random()}`
    );

    // Act
    const mutation = `
      mutation DeleteOfficerRole($id: ID!) {
        deleteOfficerRole(id: $id) {
          officer_role_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables: { id: created.officer_role_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteOfficerRole.officer_role_id).toBe(
      created.officer_role_id
    );

    // Verify it's gone
    const verifyQuery = `query { officerRole(id: "${created.officer_role_id}") { officer_role_id } }`;
    const verifyResponse = await request(app)
      .post('/')
      .send({ query: verifyQuery });
    expect(verifyResponse.body.data.officerRole).toBeNull();
  });
});
