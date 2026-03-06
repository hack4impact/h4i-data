import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

const createTestOfficerRole = async (name: string) => {
  const res = await request(app)
    .post('/')
    .send({
      query: `mutation ($input: CreateOfficerRoleInput!) { createOfficerRole(input: $input) { role_id name } }`,
      variables: { input: { name } },
    });
  return res.body.data.createOfficerRole;
};

describe('GraphQL API - Officer Roles', () => {
  it('should create an officer role', async () => {
    const role = await createTestOfficerRole('Chapter President');

    expect(role).toHaveProperty('role_id');
    expect(role.name).toBe('Chapter President');
  });

  it('should fetch an officer role by ID', async () => {
    const created = await createTestOfficerRole(`Role ${Date.now()}`);

    const res = await request(app)
      .post('/')
      .send({
        query: `query ($id: ID!) { officerRole(id: $id) { role_id name } }`,
        variables: { id: created.role_id },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.officerRole.role_id).toBe(created.role_id);
  });

  it('should fetch all officer roles', async () => {
    await createTestOfficerRole(`Role ${Date.now()}`);

    const res = await request(app).post('/').send({
      query: `query { officerRoles { role_id name } }`,
    });

    expect(res.body.errors).toBeUndefined();
    expect(Array.isArray(res.body.data.officerRoles)).toBe(true);
    expect(res.body.data.officerRoles.length).toBeGreaterThan(0);
  });

  it('should update an officer role', async () => {
    const created = await createTestOfficerRole(`Role ${Date.now()}`);

    const res = await request(app)
      .post('/')
      .send({
        query: `mutation ($id: ID!, $input: UpdateOfficerRoleInput!) { updateOfficerRole(id: $id, input: $input) { name scope } }`,
        variables: {
          id: created.role_id,
          input: { name: 'Updated Role', scope: 'CENTRAL' },
        },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.updateOfficerRole.name).toBe('Updated Role');
  });

  it('should delete an officer role', async () => {
    const created = await createTestOfficerRole(`Role ${Date.now()}`);

    const res = await request(app)
      .post('/')
      .send({
        query: `mutation ($id: ID!) { deleteOfficerRole(id: $id) { role_id } }`,
        variables: { id: created.role_id },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.deleteOfficerRole.role_id).toBe(created.role_id);
  });
});
