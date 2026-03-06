import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

const createTestMajor = async (name: string) => {
  const res = await request(app)
    .post('/')
    .send({
      query: `mutation ($input: CreateMajorInput!) { createMajor(input: $input) { major_id name } }`,
      variables: { input: { name } },
    });
  return res.body.data.createMajor;
};

describe('GraphQL API - Majors', () => {
  it('should create a major', async () => {
    const major = await createTestMajor('Computer Science');

    expect(major).toHaveProperty('major_id');
    expect(major.name).toBe('Computer Science');
  });

  it('should fetch a major by ID', async () => {
    const created = await createTestMajor(`Major ${Date.now()}`);

    const res = await request(app)
      .post('/')
      .send({
        query: `query ($id: ID!) { major(id: $id) { major_id name } }`,
        variables: { id: created.major_id },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.major.major_id).toBe(created.major_id);
  });

  it('should fetch all majors', async () => {
    await createTestMajor(`Major ${Date.now()}`);

    const res = await request(app).post('/').send({
      query: `query { majors { major_id name } }`,
    });

    expect(res.body.errors).toBeUndefined();
    expect(Array.isArray(res.body.data.majors)).toBe(true);
    expect(res.body.data.majors.length).toBeGreaterThan(0);
  });

  it('should update a major', async () => {
    const created = await createTestMajor(`Major ${Date.now()}`);

    const res = await request(app)
      .post('/')
      .send({
        query: `mutation ($id: ID!, $input: UpdateMajorInput!) { updateMajor(id: $id, input: $input) { name } }`,
        variables: { id: created.major_id, input: { name: 'Updated Major' } },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.updateMajor.name).toBe('Updated Major');
  });

  it('should delete a major', async () => {
    const created = await createTestMajor(`Major ${Date.now()}`);

    const res = await request(app)
      .post('/')
      .send({
        query: `mutation ($id: ID!) { deleteMajor(id: $id) { major_id } }`,
        variables: { id: created.major_id },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.deleteMajor.major_id).toBe(created.major_id);
  });
});
