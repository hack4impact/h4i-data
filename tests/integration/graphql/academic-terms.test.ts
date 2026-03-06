import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

const createTestAcademicTerm = async (name: string) => {
  const res = await request(app)
    .post('/')
    .send({
      query: `mutation ($input: CreateAcademicTermInput!) { createAcademicTerm(input: $input) { term_id name type } }`,
      variables: { input: { name, type: 'SEMESTER' } },
    });
  return res.body.data.createAcademicTerm;
};

describe('GraphQL API - Academic Terms', () => {
  it('should create an academic term', async () => {
    const term = await createTestAcademicTerm('Fall 2025');

    expect(term).toHaveProperty('term_id');
    expect(term.name).toBe('Fall 2025');
    expect(term.type).toBe('SEMESTER');
  });

  it('should fetch an academic term by ID', async () => {
    const created = await createTestAcademicTerm(`Term ${Date.now()}`);

    const res = await request(app)
      .post('/')
      .send({
        query: `query ($id: ID!) { academicTerm(id: $id) { term_id name } }`,
        variables: { id: created.term_id },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.academicTerm.term_id).toBe(created.term_id);
  });

  it('should fetch all academic terms', async () => {
    await createTestAcademicTerm(`Term ${Date.now()}`);

    const res = await request(app).post('/').send({
      query: `query { academicTerms { term_id name } }`,
    });

    expect(res.body.errors).toBeUndefined();
    expect(Array.isArray(res.body.data.academicTerms)).toBe(true);
    expect(res.body.data.academicTerms.length).toBeGreaterThan(0);
  });

  it('should update an academic term', async () => {
    const created = await createTestAcademicTerm(`Term ${Date.now()}`);

    const res = await request(app)
      .post('/')
      .send({
        query: `mutation ($id: ID!, $input: UpdateAcademicTermInput!) { updateAcademicTerm(id: $id, input: $input) { name type } }`,
        variables: {
          id: created.term_id,
          input: { name: 'Spring 2026', type: 'QUARTER' },
        },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.updateAcademicTerm.name).toBe('Spring 2026');
  });

  it('should delete an academic term', async () => {
    const created = await createTestAcademicTerm(`Term ${Date.now()}`);

    const res = await request(app)
      .post('/')
      .send({
        query: `mutation ($id: ID!) { deleteAcademicTerm(id: $id) { term_id } }`,
        variables: { id: created.term_id },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.deleteAcademicTerm.term_id).toBe(created.term_id);
  });
});
