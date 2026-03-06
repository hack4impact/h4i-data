import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

const createTestProjectRole = async (name: string) => {
  const mutation = `
    mutation CreateProjectRole($input: CreateProjectRoleInput!) {
      createProjectRole(input: $input) {
        role_id
        name
        is_leadership
      }
    }
  `;
  const response = await request(app)
    .post('/')
    .send({ query: mutation, variables: { input: { name } } });
  return response.body.data.createProjectRole;
};

describe('GraphQL API - Project Roles', () => {
  it('should create a new project role via mutation', async () => {
    // Act
    const mutation = `
      mutation CreateProjectRole($input: CreateProjectRoleInput!) {
        createProjectRole(input: $input) {
          role_id
          name
          is_leadership
        }
      }
    `;
    const variables = { input: { name: 'Tech Lead', is_leadership: true } };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const role = response.body.data.createProjectRole;
    expect(role).toHaveProperty('role_id');
    expect(role.name).toBe('Tech Lead');
    expect(role.is_leadership).toBe(true);
  });

  it('should fetch a project role by ID via query', async () => {
    // Arrange
    const created = await createTestProjectRole(
      `Role ${Date.now()}.${Math.random()}`
    );

    // Act
    const query = `
      query ProjectRole($id: ID!) {
        projectRole(id: $id) {
          role_id
          name
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query, variables: { id: created.role_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.projectRole.role_id).toBe(created.role_id);
  });

  it('should return null for a non-existent project role ID', async () => {
    // Act
    const query = `
      query {
        projectRole(id: "00000000-0000-0000-0000-000000000000") {
          role_id
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.projectRole).toBeNull();
  });

  it('should fetch all project roles via query', async () => {
    // Arrange
    await createTestProjectRole(`Role ${Date.now()}.${Math.random()}`);

    // Act
    const query = `query { projectRoles { role_id name } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.projectRoles)).toBe(true);
    expect(response.body.data.projectRoles.length).toBeGreaterThan(0);
  });

  it('should update a project role via mutation', async () => {
    // Arrange
    const created = await createTestProjectRole(
      `Role ${Date.now()}.${Math.random()}`
    );

    // Act
    const mutation = `
      mutation UpdateProjectRole($id: ID!, $input: UpdateProjectRoleInput!) {
        updateProjectRole(id: $id, input: $input) {
          role_id
          name
          is_leadership
        }
      }
    `;
    const variables = {
      id: created.role_id,
      input: { name: 'Updated Role', is_leadership: true },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateProjectRole.name).toBe('Updated Role');
    expect(response.body.data.updateProjectRole.is_leadership).toBe(true);
  });

  it('should delete a project role via mutation', async () => {
    // Arrange
    const created = await createTestProjectRole(`Role ${Date.now()}`);

    // Act
    const mutation = `
      mutation DeleteProjectRole($id: ID!) {
        deleteProjectRole(id: $id) {
          role_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables: { id: created.role_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteProjectRole.role_id).toBe(created.role_id);

    // Verify it's gone
    const verifyQuery = `query { projectRole(id: "${created.role_id}") { role_id } }`;
    const verifyResponse = await request(app)
      .post('/')
      .send({ query: verifyQuery });
    expect(verifyResponse.body.data.projectRole).toBeNull();
  });
});
