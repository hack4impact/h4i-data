import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { env } from '../../../src/config/server';
import { level_type } from '@prisma/client';

let server: Server;
let app: express.Application;

beforeAll(() => {
  app = createGraphqlApp();
  server = app.listen(env.GRAPHQL_PORT);
});

afterAll(() => {
  server.close();
});

describe('GraphQL API - Roles', () => {
  it('should create a new role via mutation', async () => {
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
        name: `Admin-${Date.now()}`,
        description: 'Full access to management actions',
        permissions: { manage_users: true, manage_events: true },
        level_type: 'OPERATIONS_BOARD_LEVEL' as level_type,
      },
    };

    const response = await request(server)
      .post('/') // GraphQL server is at the root
      .send({ query: mutation, variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const role = response.body.data.createRole;
    expect(role).toHaveProperty('role_id');
    expect(role.name).toMatch(/^Admin-/);
    expect(role.permissions).toEqual(
      expect.objectContaining({ manage_users: true, manage_events: true })
    );
  });

  it('should create and fetch a role by its ID via query', async () => {
    // Create a role first
    const createMutation = `
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
    const createVariables = {
      input: {
        name: `Editor-${Date.now()}`,
        description: 'Can edit content',
        permissions: { edit_content: true },
        level_type: 'OPERATIONS_BOARD_LEVEL' as level_type,
      },
    };

    const createResponse = await request(server)
      .post('/')
      .send({ query: createMutation, variables: createVariables });

    expect(createResponse.status).toBe(200);
    expect(createResponse.body.errors).toBeUndefined();
    const roleId = createResponse.body.data.createRole.role_id;

    // Fetch it by ID
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
    const variables = { id: roleId };

    const response = await request(server).post('/').send({ query, variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const role = response.body.data.role;
    expect(role.role_id).toBe(roleId);
    expect(role.name).toMatch(/^Editor-/);
    expect(role.permissions).toEqual(
      expect.objectContaining({ edit_content: true })
    );
  });

  it('should fetch all roles', async () => {
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

    const response = await request(server).get('/').send({ query });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const roles = response.body.data.roles;
    expect(Array.isArray(roles)).toBe(true);
  });

  it("should provide an error if role doesn't exist", async () => {
    const query = `
      query {
        role(id: "non-existent-id") {
          role_id
          name
        }
      }
    `;

    const response = await request(server).get('/').send({ query });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.data.role).toBeNull();
    expect(response.body.errors).toBeDefined();
    // Depending on your resolver error mapping, this may be "Role not found" or a wrapped DB error:
    expect(response.body.errors[0].message).toMatch(
      /Role not found|Failed to retrieve role/
    );
  });

  it('should update a role', async () => {
    // Create a role to update
    const createMutation = `
      mutation CreateRole($input: CreateRoleInput!) {
        createRole(input: $input) {
          role_id
          name
          description
          permissions
        }
      }
    `;
    const createVariables = {
      input: {
        name: `Contributor-${Date.now()}`,
        description: 'Limited content permissions',
        permissions: { create_posts: true },
        level_type: 'OPERATIONS_BOARD_LEVEL' as level_type,
      },
    };

    const createResponse = await request(server)
      .post('/')
      .send({ query: createMutation, variables: createVariables });

    expect(createResponse.status).toBe(200);
    expect(createResponse.body.errors).toBeUndefined();
    const roleId = createResponse.body.data.createRole.role_id;

    // Update the role
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
      id: roleId,
      input: {
        name: 'Updated Contributor',
        description: 'Updated description',
        permissions: { create_posts: true, comment: true },
        level_type: 'OPERATIONS_BOARD_LEVEL' as level_type,
      },
    };

    const updateResponse = await request(server)
      .post('/')
      .send({ query: updateMutation, variables: updateVariables });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.errors).toBeUndefined();
    const updatedRole = updateResponse.body.data.updateRole;
    expect(updatedRole.role_id).toBe(roleId);
    expect(updatedRole.name).toBe('Updated Contributor');
    expect(updatedRole.permissions).toEqual(
      expect.objectContaining({ create_posts: true, comment: true })
    );
  });

  it('should delete a role', async () => {
    // Create a role to delete
    const createMutation = `
      mutation CreateRole($input: CreateRoleInput!) {
        createRole(input: $input) {
          role_id
        }
      }
    `;
    const createVariables = {
      input: {
        name: `Temp-${Date.now()}`,
        description: 'To be deleted',
        permissions: { temp: true },
        level_type: 'OPERATIONS_BOARD_LEVEL' as level_type,
      },
    };
    const createResponse = await request(server)
      .post('/')
      .send({ query: createMutation, variables: createVariables });

    expect(createResponse.status).toBe(200);
    expect(createResponse.body.errors).toBeUndefined();
    const roleId = createResponse.body.data.createRole.role_id;

    // Delete it
    const deleteMutation = `
      mutation DeleteRole($id: ID!) {
        deleteRole(id: $id) {
          role_id
        }
      }
    `;
    const deleteVariables = { id: roleId };

    const deleteResponse = await request(server)
      .post('/')
      .send({ query: deleteMutation, variables: deleteVariables });

    // Assertions
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.errors).toBeUndefined();
    expect(deleteResponse.body.data.deleteRole).toHaveProperty(
      'role_id',
      roleId
    );
  });
});
