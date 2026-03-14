import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

// Helper function to create a constituent for tests
const createTestConstituent = async (email?: string) => {
  const constituentMutation = `
    mutation CreateConstituent($input: CreateConstituentInput!) {
      createConstituent(input: $input) {
        constituent_id
      }
    }
  `;
  const uniqueEmail =
    email || `test.constituent.${Date.now()}.${Math.random()}@example.com`;
  const constituentVariables = {
    input: {
      first_name: 'Test',
      last_name: 'User',
      primary_email: uniqueEmail,
    },
  };
  const response = await request(app)
    .post('/')
    .send({ query: constituentMutation, variables: constituentVariables });
  return response.body.data.createConstituent.constituent_id;
};

// Helper function to create a major lookup record for tests
const createTestMajor = async (name: string) => {
  const mutation = `
    mutation CreateMajor($input: CreateMajorInput!) {
      createMajor(input: $input) {
        major_id
      }
    }
  `;
  const response = await request(app)
    .post('/')
    .send({ query: mutation, variables: { input: { name } } });
  return response.body.data.createMajor.major_id;
};

// Helper function to create a volunteer for tests
const createTestVolunteer = async (constituentId: string) => {
  const volunteerMutation = `
    mutation CreateVolunteer($input: CreateVolunteerInput!) {
      createVolunteer(input: $input) {
        volunteer_id
      }
    }
  `;
  const volunteerVariables = {
    input: {
      volunteer_id: constituentId,
      org_email: 'test.volunteer@org.edu',
      volunteer_class: 'COLLEGIATE',
    },
  };
  const response = await request(app)
    .post('/')
    .send({ query: volunteerMutation, variables: volunteerVariables });
  return response.body.data.createVolunteer.volunteer_id;
};

describe('GraphQL API - Volunteers', () => {
  it('should create a new volunteer via mutation', async () => {
    // Arrange: Create a constituent to associate the volunteer with
    const constituentId = await createTestConstituent();

    // Act
    const mutation = `
      mutation CreateVolunteer($input: CreateVolunteerInput!) {
        createVolunteer(input: $input) {
          volunteer_id
          org_email
          volunteer_class
        }
      }
    `;
    const variables = {
      input: {
        volunteer_id: constituentId,
        org_email: 'john@org.edu',
        status: 'ACTIVE',
        volunteer_class: 'COLLEGIATE',
      },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const volunteer = response.body.data.createVolunteer;
    expect(volunteer.volunteer_id).toBe(constituentId);
    expect(volunteer.org_email).toBe('john@org.edu');
  });

  it('should fetch a volunteer by their ID via query', async () => {
    // Arrange
    const constituentId = await createTestConstituent();
    const volunteerId = await createTestVolunteer(constituentId);

    // Act
    const query = `
      query Volunteer($id: ID!) {
        volunteer(id: $id) {
          volunteer_id
          org_email
        }
      }
    `;
    const variables = { id: volunteerId };
    const response = await request(app).post('/').send({ query, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const volunteer = response.body.data.volunteer;
    expect(volunteer.volunteer_id).toBe(volunteerId);
  });

  it('should fetch all volunteers', async () => {
    // Arrange
    const constituentId = await createTestConstituent();
    await createTestVolunteer(constituentId);

    // Act
    const query = `query { volunteers { volunteer_id } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const volunteers = response.body.data.volunteers;
    expect(Array.isArray(volunteers)).toBe(true);
    expect(volunteers.length).toBeGreaterThan(0);
  });

  it("should provide an error if volunteer doesn't exist", async () => {
    // Act
    const query = `
      query {
        volunteer(id: "00000000-0000-0000-0000-000000000000") {
          volunteer_id
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.volunteer).toBeNull();
  });

  it('should update a volunteer', async () => {
    // Arrange
    const constituentId = await createTestConstituent();
    const volunteerId = await createTestVolunteer(constituentId);
    const majorId = await createTestMajor(
      `SE-GQL-${Date.now()}.${Math.random()}`
    );

    // Act
    const updateMutation = `
      mutation UpdateVolunteer($id: ID!, $input: UpdateVolunteerInput!) {
        updateVolunteer(id: $id, input: $input) {
          volunteer_id
          major_id
        }
      }
    `;
    const updateVariables = {
      id: volunteerId,
      input: { major_id: majorId },
    };
    const response = await request(app)
      .post('/')
      .send({ query: updateMutation, variables: updateVariables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const updatedVolunteer = response.body.data.updateVolunteer;
    expect(updatedVolunteer.major_id).toBe(majorId);
  });

  it('should return errors when updating a non-existent volunteer', async () => {
    // Act
    const mutation = `
      mutation UpdateVolunteer($id: ID!, $input: UpdateVolunteerInput!) {
        updateVolunteer(id: $id, input: $input) {
          volunteer_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: {
          id: '00000000-0000-0000-0000-000000000000',
          input: { org_email: 'updated@org.edu' },
        },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return a validation error for an invalid volunteer input', async () => {
    // Arrange
    const constituentId = await createTestConstituent();
    const volunteerId = await createTestVolunteer(constituentId);

    // Act
    const mutation = `
      mutation UpdateVolunteer($id: ID!, $input: UpdateVolunteerInput!) {
        updateVolunteer(id: $id, input: $input) {
          volunteer_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: { id: volunteerId, input: { org_email: 'not-an-email' } },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return errors when deleting a non-existent volunteer', async () => {
    // Act
    const mutation = `
      mutation DeleteVolunteer($id: ID!) {
        deleteVolunteer(id: $id) {
          volunteer_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: { id: '00000000-0000-0000-0000-000000000000' },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should delete a volunteer', async () => {
    // Arrange
    const constituentId = await createTestConstituent();
    const volunteerId = await createTestVolunteer(constituentId);

    // Act
    const deleteMutation = `
      mutation DeleteVolunteer($id: ID!) {
        deleteVolunteer(id: $id) {
          volunteer_id
        }
      }
    `;
    const deleteVariables = { id: volunteerId };
    const response = await request(app)
      .post('/')
      .send({ query: deleteMutation, variables: deleteVariables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteVolunteer.volunteer_id).toBe(volunteerId);

    // Verify deletion
    const verifyQuery = `
      query {
        volunteer(id: "${volunteerId}") {
          volunteer_id
        }
      }
    `;
    const verifyResponse = await request(app)
      .post('/')
      .send({ query: verifyQuery });
    expect(verifyResponse.body.data.volunteer).toBeNull();
  });
});
