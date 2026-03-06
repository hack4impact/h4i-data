import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

// Helper function to create a constituent for tests
const createTestConstituent = async (email?: string) => {
  const mutation = `
    mutation CreateConstituent($input: CreateConstituentInput!) {
      createConstituent(input: $input) {
        constituent_id
      }
    }
  `;
  const uniqueEmail =
    email || `test.mentor.gql.${Date.now()}.${Math.random()}@example.com`;
  const variables = {
    input: {
      first_name: 'Test',
      last_name: 'Mentor',
      primary_email: uniqueEmail,
    },
  };
  const response = await request(app)
    .post('/')
    .send({ query: mutation, variables });
  return response.body.data.createConstituent.constituent_id;
};

// Helper function to create a mentor for tests
const createTestMentor = async (constituentId: string) => {
  const mutation = `
    mutation CreateMentor($input: CreateMentorInput!) {
      createMentor(input: $input) {
        mentor_id
        expertise_area
      }
    }
  `;
  const variables = {
    input: {
      mentor_id: constituentId,
      status: 'ACTIVE',
      expertise_area: 'Web Development',
      max_mentees: 3,
    },
  };
  const response = await request(app)
    .post('/')
    .send({ query: mutation, variables });
  return response.body.data.createMentor;
};

describe('GraphQL API - Mentors', () => {
  it('should create a new mentor via mutation', async () => {
    // Arrange
    const constituentId = await createTestConstituent();

    // Act
    const mutation = `
      mutation CreateMentor($input: CreateMentorInput!) {
        createMentor(input: $input) {
          mentor_id
          status
          expertise_area
          max_mentees
        }
      }
    `;
    const variables = {
      input: {
        mentor_id: constituentId,
        status: 'ACTIVE',
        expertise_area: 'Data Science',
        max_mentees: 5,
      },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const mentor = response.body.data.createMentor;
    expect(mentor.mentor_id).toBe(constituentId);
    expect(mentor.expertise_area).toBe('Data Science');
  });

  it('should fetch a mentor by ID via query', async () => {
    // Arrange
    const constituentId = await createTestConstituent();
    const created = await createTestMentor(constituentId);

    // Act
    const query = `
      query Mentor($id: ID!) {
        mentor(id: $id) {
          mentor_id
          expertise_area
        }
      }
    `;
    const variables = { id: created.mentor_id };
    const response = await request(app).post('/').send({ query, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.mentor.mentor_id).toBe(created.mentor_id);
  });

  it('should fetch all mentors', async () => {
    // Arrange
    const constituentId = await createTestConstituent();
    await createTestMentor(constituentId);

    // Act
    const query = `query { mentors { mentor_id } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const mentors = response.body.data.mentors;
    expect(Array.isArray(mentors)).toBe(true);
    expect(mentors.length).toBeGreaterThan(0);
  });

  it('should return null for non-existent mentor', async () => {
    // Act
    const query = `
      query {
        mentor(id: "00000000-0000-0000-0000-000000000000") {
          mentor_id
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.mentor).toBeNull();
  });

  it('should update a mentor', async () => {
    // Arrange
    const constituentId = await createTestConstituent();
    const created = await createTestMentor(constituentId);

    // Act
    const mutation = `
      mutation UpdateMentor($id: ID!, $input: UpdateMentorInput!) {
        updateMentor(id: $id, input: $input) {
          mentor_id
          expertise_area
          max_mentees
        }
      }
    `;
    const variables = {
      id: created.mentor_id,
      input: { expertise_area: 'Machine Learning', max_mentees: 10 },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const updated = response.body.data.updateMentor;
    expect(updated.expertise_area).toBe('Machine Learning');
    expect(updated.max_mentees).toBe(10);
  });

  it('should delete a mentor', async () => {
    // Arrange
    const constituentId = await createTestConstituent();
    const created = await createTestMentor(constituentId);

    // Act
    const mutation = `
      mutation DeleteMentor($id: ID!) {
        deleteMentor(id: $id) {
          mentor_id
        }
      }
    `;
    const variables = { id: created.mentor_id };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteMentor.mentor_id).toBe(created.mentor_id);
  });
});
