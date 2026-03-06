import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { createRestApp } from '../../../src/api/rest/server';

const app = createGraphqlApp();
const restApp = createRestApp();

const createTestVolunteer = async () => {
  const constituentRes = await request(restApp)
    .post('/constituents')
    .send({
      first_name: 'Test',
      last_name: 'Volunteer',
      primary_email: `gql.vh.${Date.now()}.${Math.random()}@example.com`,
    });
  const id = constituentRes.body.constituent_id;
  await request(restApp)
    .post('/volunteers')
    .send({ volunteer_id: id, volunteer_class: 'COLLEGIATE' });
  return id;
};

const createTestHistoryRecord = async (volunteerId: string) => {
  const mutation = `
    mutation CreateVolunteerHistory($input: CreateVolunteerHistoryInput!) {
      createVolunteerHistory(input: $input) {
        history_id
        volunteer_id
        action_type
      }
    }
  `;
  const response = await request(app)
    .post('/')
    .send({
      query: mutation,
      variables: {
        input: {
          volunteer_id: volunteerId,
          action_type: 'ENROLLED',
          effective_date: '2025-01-01',
        },
      },
    });
  return response.body.data.createVolunteerHistory;
};

describe('GraphQL API - Volunteer History', () => {
  it('should create a new volunteer history record via mutation', async () => {
    // Arrange
    const volunteerId = await createTestVolunteer();

    // Act
    const mutation = `
      mutation CreateVolunteerHistory($input: CreateVolunteerHistoryInput!) {
        createVolunteerHistory(input: $input) {
          history_id
          volunteer_id
          action_type
          effective_date
        }
      }
    `;
    const variables = {
      input: {
        volunteer_id: volunteerId,
        action_type: 'ENROLLED',
        effective_date: '2025-01-01',
      },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const record = response.body.data.createVolunteerHistory;
    expect(record).toHaveProperty('history_id');
    expect(record.volunteer_id).toBe(volunteerId);
    expect(record.action_type).toBe('ENROLLED');
  });

  it('should fetch a volunteer history record by ID via query', async () => {
    // Arrange
    const volunteerId = await createTestVolunteer();
    const created = await createTestHistoryRecord(volunteerId);

    // Act
    const query = `
      query VolunteerHistory($id: ID!) {
        volunteerHistory(id: $id) {
          history_id
          action_type
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query, variables: { id: created.history_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.volunteerHistory.history_id).toBe(
      created.history_id
    );
  });

  it('should return null for a non-existent volunteer history ID', async () => {
    // Act
    const query = `
      query {
        volunteerHistory(id: "00000000-0000-0000-0000-000000000000") {
          history_id
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.volunteerHistory).toBeNull();
  });

  it('should fetch all volunteer history records via query', async () => {
    // Arrange
    const volunteerId = await createTestVolunteer();
    await createTestHistoryRecord(volunteerId);

    // Act
    const query = `query { volunteerHistories { history_id action_type } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.volunteerHistories)).toBe(true);
    expect(response.body.data.volunteerHistories.length).toBeGreaterThan(0);
  });

  it('should update a volunteer history record via mutation', async () => {
    // Arrange
    const volunteerId = await createTestVolunteer();
    const created = await createTestHistoryRecord(volunteerId);

    // Act
    const mutation = `
      mutation UpdateVolunteerHistory($id: ID!, $input: UpdateVolunteerHistoryInput!) {
        updateVolunteerHistory(id: $id, input: $input) {
          history_id
          new_value_label
        }
      }
    `;
    const variables = {
      id: created.history_id,
      input: { new_value_label: 'Updated label' },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateVolunteerHistory.new_value_label).toBe(
      'Updated label'
    );
  });

  it('should delete a volunteer history record via mutation', async () => {
    // Arrange
    const volunteerId = await createTestVolunteer();
    const created = await createTestHistoryRecord(volunteerId);

    // Act
    const mutation = `
      mutation DeleteVolunteerHistory($id: ID!) {
        deleteVolunteerHistory(id: $id) {
          history_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables: { id: created.history_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteVolunteerHistory.history_id).toBe(
      created.history_id
    );

    // Verify it's gone
    const verifyQuery = `query { volunteerHistory(id: "${created.history_id}") { history_id } }`;
    const verifyResponse = await request(app)
      .post('/')
      .send({ query: verifyQuery });
    expect(verifyResponse.body.data.volunteerHistory).toBeNull();
  });
});
