import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

const createTestProjectRole = async (name: string) => {
  const res = await request(app)
    .post('/')
    .send({
      query: `mutation ($input: CreateProjectRoleInput!) { createProjectRole(input: $input) { role_id name is_leadership } }`,
      variables: { input: { name } },
    });
  return res.body.data.createProjectRole;
};

describe('GraphQL API - Project Roles', () => {
  it('should create a project role', async () => {
    const role = await createTestProjectRole('Tech Lead');

    expect(role).toHaveProperty('role_id');
    expect(role.name).toBe('Tech Lead');
  });

  it('should fetch a project role by ID', async () => {
    const created = await createTestProjectRole(`Role ${Date.now()}`);

    const res = await request(app)
      .post('/')
      .send({
        query: `query ($id: ID!) { projectRole(id: $id) { role_id name } }`,
        variables: { id: created.role_id },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.projectRole.role_id).toBe(created.role_id);
  });

  it('should fetch all project roles', async () => {
    await createTestProjectRole(`Role ${Date.now()}`);

    const res = await request(app).post('/').send({
      query: `query { projectRoles { role_id name } }`,
    });

    expect(res.body.errors).toBeUndefined();
    expect(Array.isArray(res.body.data.projectRoles)).toBe(true);
    expect(res.body.data.projectRoles.length).toBeGreaterThan(0);
  });

  it('should update a project role', async () => {
    const created = await createTestProjectRole(`Role ${Date.now()}`);

    const res = await request(app)
      .post('/')
      .send({
        query: `mutation ($id: ID!, $input: UpdateProjectRoleInput!) { updateProjectRole(id: $id, input: $input) { name is_leadership } }`,
        variables: {
          id: created.role_id,
          input: { name: 'Updated Role', is_leadership: true },
        },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.updateProjectRole.name).toBe('Updated Role');
    expect(res.body.data.updateProjectRole.is_leadership).toBe(true);
  });

  it('should delete a project role', async () => {
    const created = await createTestProjectRole(`Role ${Date.now()}`);

    const res = await request(app)
      .post('/')
      .send({
        query: `mutation ($id: ID!) { deleteProjectRole(id: $id) { role_id } }`,
        variables: { id: created.role_id },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.deleteProjectRole.role_id).toBe(created.role_id);
  });
});
