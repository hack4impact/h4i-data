import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { createRestApp } from '../../../src/api/rest/server';

const gqlApp = createGraphqlApp();
const restApp = createRestApp();

const createTestMentor = async () => {
  const constituentRes = await request(restApp)
    .post('/constituents')
    .send({
      first_name: 'Test',
      last_name: 'Mentor',
      primary_email: `gql.mentor.${Date.now()}.${Math.random()}@example.com`,
    });
  const id = constituentRes.body.constituent_id;
  await request(restApp)
    .post('/volunteers')
    .send({ volunteer_id: id, volunteer_class: 'ALUMNI' });
  await request(restApp).post('/mentors').send({ mentor_id: id });
  return id;
};

describe('GraphQL API - Mentorships', () => {
  it('should create a mentorship', async () => {
    const mentorId = await createTestMentor();
    const menteeId = await createTestMentor();

    const res = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateMentorshipInput!) { createMentorship(input: $input) { mentorship_id mentor_id mentee_id status } }`,
        variables: {
          input: { mentor_id: mentorId, mentee_id: menteeId, status: 'ACTIVE' },
        },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.createMentorship).toHaveProperty('mentorship_id');
    expect(res.body.data.createMentorship.mentor_id).toBe(mentorId);
  });

  it('should fetch a mentorship by ID', async () => {
    const mentorId = await createTestMentor();
    const menteeId = await createTestMentor();
    const created = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateMentorshipInput!) { createMentorship(input: $input) { mentorship_id } }`,
        variables: { input: { mentor_id: mentorId, mentee_id: menteeId } },
      });
    const id = created.body.data.createMentorship.mentorship_id;

    const res = await request(gqlApp).post('/').send({
      query: `query ($id: ID!) { mentorship(id: $id) { mentorship_id status } }`,
      variables: { id },
    });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.mentorship.mentorship_id).toBe(id);
  });

  it('should fetch all mentorships', async () => {
    const mentorId = await createTestMentor();
    const menteeId = await createTestMentor();
    await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateMentorshipInput!) { createMentorship(input: $input) { mentorship_id } }`,
        variables: { input: { mentor_id: mentorId, mentee_id: menteeId } },
      });

    const res = await request(gqlApp).post('/').send({
      query: `query { mentorships { mentorship_id status } }`,
    });

    expect(res.body.errors).toBeUndefined();
    expect(Array.isArray(res.body.data.mentorships)).toBe(true);
    expect(res.body.data.mentorships.length).toBeGreaterThan(0);
  });

  it('should update a mentorship', async () => {
    const mentorId = await createTestMentor();
    const menteeId = await createTestMentor();
    const created = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateMentorshipInput!) { createMentorship(input: $input) { mentorship_id } }`,
        variables: { input: { mentor_id: mentorId, mentee_id: menteeId } },
      });
    const id = created.body.data.createMentorship.mentorship_id;

    const res = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($id: ID!, $input: UpdateMentorshipInput!) { updateMentorship(id: $id, input: $input) { status notes } }`,
        variables: { id, input: { status: 'COMPLETED', notes: 'Completed' } },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.updateMentorship.status).toBe('COMPLETED');
  });

  it('should delete a mentorship', async () => {
    const mentorId = await createTestMentor();
    const menteeId = await createTestMentor();
    const created = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateMentorshipInput!) { createMentorship(input: $input) { mentorship_id } }`,
        variables: { input: { mentor_id: mentorId, mentee_id: menteeId } },
      });
    const id = created.body.data.createMentorship.mentorship_id;

    const res = await request(gqlApp).post('/').send({
      query: `mutation ($id: ID!) { deleteMentorship(id: $id) { mentorship_id } }`,
      variables: { id },
    });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.deleteMentorship.mentorship_id).toBe(id);
  });
});
