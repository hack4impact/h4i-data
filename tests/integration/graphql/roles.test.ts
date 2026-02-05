import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { level_type } from '@prisma/client';

const app = createGraphqlApp();

// Helper to create a role for tests
const createTestRole = async (name = 'Test Role') => {
  const mutation = `
    mutation CreateRole($input: CreateRoleInput!) {
      createRole(input: $input) {
        role_id
        name
        description
        permissions
        level_type
      }
    }
  `;
  const variables = {
    input: {
      name,
      description: 'Full access to management actions',
      permissions: { manage_users: true, manage_events: true },
      level_type: 'OPERATIONS_BOARD_LEVEL' as level_type,
    },
  };
  const response = await request(app)
    .post('/')
    .send({ query: mutation, variables });
  return response.body.data.createRole;
};

describe('GraphQL API - Roles', () => {
  it('should create a new role via mutation', async () => {
    // Act
    const role = await createTestRole(`Admin-${Date.now()}`);

    // Assert
    expect(role).toHaveProperty('role_id');
    expect(role.name).toMatch(/^Admin-/);
    expect(role.permissions).toEqual(
      expect.objectContaining({ manage_users: true, manage_events: true })
    );
  });

  it('should fetch a role by its ID via query', async () => {
    // Arrange
    const role = await createTestRole(`Role for Fetch ${Date.now()}`);

    // Act
    const query = `
      query Role($id: ID!) {
        role(id: $id) {
          role_id
          name
          description
          permissions
          level_type
        }
      }
    `;
    const variables = { id: role.role_id };
    const response = await request(app).post('/').send({ query, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.role.role_id).toBe(role.role_id);
    expect(response.body.data.role.permissions).toEqual(
      expect.objectContaining({ manage_users: true, manage_events: true })
    );
  });

  it('should fetch all roles', async () => {
    // Arrange
    await createTestRole(`Role for List ${Date.now()}`);

    // Act
    const query = `
      query {
        roles {
          role_id
          name
          description
          permissions
          level_type
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.roles)).toBe(true);
  });

  it("should provide an error if role doesn't exist", async () => {
    // Act
    const query = `
      query {
        role(id: "00000000-0000-0000-0000-000000000000") {
          role_id
          name
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.role).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toMatch(
      /Role not found|Failed to retrieve role/
    );
  });

  it('should update a role', async () => {
    // Arrange
    const role = await createTestRole(`Role for Update ${Date.now()}`);

    // Act
    const updateMutation = `
      mutation UpdateRole($id: ID!, $input: UpdateRoleInput!) {
        updateRole(id: $id, input: $input) {
          role_id
          name
          description
          permissions
        }
      }
    `;
    const updateVariables = {
      id: role.role_id,
      input: {
        name: 'Updated Contributor',
        description: 'Updated description',
        permissions: { create_posts: true, comment: true },
        level_type: 'OPERATIONS_BOARD_LEVEL' as level_type,
      },
    };

    const updateResponse = await request(app)
      .post('/')
      .send({ query: updateMutation, variables: updateVariables });

    // Assert
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.errors).toBeUndefined();
    const updatedRole = updateResponse.body.data.updateRole;
    expect(updatedRole.role_id).toBe(role.role_id);
    expect(updatedRole.name).toBe('Updated Contributor');
    expect(updatedRole.permissions).toEqual(
      expect.objectContaining({ create_posts: true, comment: true })
    );
  });

  it('should delete a role', async () => {
    // Arrange
    const role = await createTestRole(`Role for Delete ${Date.now()}`);

    // Act
    const deleteMutation = `
      mutation DeleteRole($id: ID!) {
        deleteRole(id: $id) {
          role_id
        }
      }
    `;
    const deleteVariables = { id: role.role_id };

    const deleteResponse = await request(app)
      .post('/')
      .send({ query: deleteMutation, variables: deleteVariables });

    // Assert
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.errors).toBeUndefined();
    expect(deleteResponse.body.data.deleteRole).toHaveProperty(
      'role_id',
      role.role_id
    );
  });
});
