import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { createRestApp } from '../../../src/api/rest/server';

const app = createGraphqlApp();
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

const createTestMentorship = async (mentorId: string, menteeId: string) => {
  const mutation = `
    mutation CreateMentorship($input: CreateMentorshipInput!) {
      createMentorship(input: $input) {
        mentorship_id
        mentor_id
        mentee_id
        status
      }
    }
  `;
  const response = await request(app)
    .post('/')
    .send({
      query: mutation,
      variables: { input: { mentor_id: mentorId, mentee_id: menteeId } },
    });
  return response.body.data.createMentorship;
};

describe('GraphQL API - Mentorships', () => {
  it('should create a new mentorship via mutation', async () => {
    // Arrange
    const mentorId = await createTestMentor();
    const menteeId = await createTestMentor();

    // Act
    const mutation = `
      mutation CreateMentorship($input: CreateMentorshipInput!) {
        createMentorship(input: $input) {
          mentorship_id
          mentor_id
          mentee_id
          status
        }
      }
    `;
    const variables = {
      input: { mentor_id: mentorId, mentee_id: menteeId, status: 'ACTIVE' },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const mentorship = response.body.data.createMentorship;
    expect(mentorship).toHaveProperty('mentorship_id');
    expect(mentorship.mentor_id).toBe(mentorId);
    expect(mentorship.mentee_id).toBe(menteeId);
    expect(mentorship.status).toBe('ACTIVE');
  });

  it('should fetch a mentorship by ID via query', async () => {
    // Arrange
    const mentorId = await createTestMentor();
    const menteeId = await createTestMentor();
    const created = await createTestMentorship(mentorId, menteeId);

    // Act
    const query = `
      query Mentorship($id: ID!) {
        mentorship(id: $id) {
          mentorship_id
          status
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query, variables: { id: created.mentorship_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.mentorship.mentorship_id).toBe(
      created.mentorship_id
    );
  });

  it('should return null for a non-existent mentorship ID', async () => {
    // Act
    const query = `
      query {
        mentorship(id: "00000000-0000-0000-0000-000000000000") {
          mentorship_id
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.mentorship).toBeNull();
  });

  it('should fetch all mentorships via query', async () => {
    // Arrange
    const mentorId = await createTestMentor();
    const menteeId = await createTestMentor();
    await createTestMentorship(mentorId, menteeId);

    // Act
    const query = `query { mentorships { mentorship_id status } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.mentorships)).toBe(true);
    expect(response.body.data.mentorships.length).toBeGreaterThan(0);
  });

  it('should update a mentorship via mutation', async () => {
    // Arrange
    const mentorId = await createTestMentor();
    const menteeId = await createTestMentor();
    const created = await createTestMentorship(mentorId, menteeId);

    // Act
    const mutation = `
      mutation UpdateMentorship($id: ID!, $input: UpdateMentorshipInput!) {
        updateMentorship(id: $id, input: $input) {
          mentorship_id
          status
          notes
        }
      }
    `;
    const variables = {
      id: created.mentorship_id,
      input: { status: 'COMPLETED', notes: 'Completed successfully' },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateMentorship.status).toBe('COMPLETED');
    expect(response.body.data.updateMentorship.notes).toBe(
      'Completed successfully'
    );
  });

  it('should delete a mentorship via mutation', async () => {
    // Arrange
    const mentorId = await createTestMentor();
    const menteeId = await createTestMentor();
    const created = await createTestMentorship(mentorId, menteeId);

    // Act
    const mutation = `
      mutation DeleteMentorship($id: ID!) {
        deleteMentorship(id: $id) {
          mentorship_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables: { id: created.mentorship_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteMentorship.mentorship_id).toBe(
      created.mentorship_id
    );

    // Verify it's gone
    const verifyQuery = `query { mentorship(id: "${created.mentorship_id}") { mentorship_id } }`;
    const verifyResponse = await request(app)
      .post('/')
      .send({ query: verifyQuery });
    expect(verifyResponse.body.data.mentorship).toBeNull();
  });
});
