import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

const createTestUniversity = async (name: string) => {
  const res = await request(app)
    .post('/')
    .send({
      query: `mutation ($input: CreateUniversityInput!) { createUniversity(input: $input) { university_id name } }`,
      variables: { input: { name } },
    });
  return res.body.data.createUniversity;
};

describe('GraphQL API - Universities', () => {
  it('should create a university', async () => {
    const university = await createTestUniversity('Test University');

    expect(university).toHaveProperty('university_id');
    expect(university.name).toBe('Test University');
  });

  it('should fetch a university by ID', async () => {
    const created = await createTestUniversity(`University ${Date.now()}`);

    const res = await request(app)
      .post('/')
      .send({
        query: `query ($id: ID!) { university(id: $id) { university_id name } }`,
        variables: { id: created.university_id },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.university.university_id).toBe(created.university_id);
  });

  it('should fetch all universities', async () => {
    await createTestUniversity(`University ${Date.now()}`);

    const res = await request(app).post('/').send({
      query: `query { universities { university_id name } }`,
    });

    expect(res.body.errors).toBeUndefined();
    expect(Array.isArray(res.body.data.universities)).toBe(true);
    expect(res.body.data.universities.length).toBeGreaterThan(0);
  });

  it('should update a university', async () => {
    const created = await createTestUniversity(`University ${Date.now()}`);

    const res = await request(app)
      .post('/')
      .send({
        query: `mutation ($id: ID!, $input: UpdateUniversityInput!) { updateUniversity(id: $id, input: $input) { name email_domain } }`,
        variables: {
          id: created.university_id,
          input: { name: 'Updated University', email_domain: 'updated.edu' },
        },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.updateUniversity.name).toBe('Updated University');
  });

  it('should delete a university', async () => {
    const created = await createTestUniversity(`University ${Date.now()}`);

    const res = await request(app)
      .post('/')
      .send({
        query: `mutation ($id: ID!) { deleteUniversity(id: $id) { university_id } }`,
        variables: { id: created.university_id },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.deleteUniversity.university_id).toBe(
      created.university_id
    );
  });
});
