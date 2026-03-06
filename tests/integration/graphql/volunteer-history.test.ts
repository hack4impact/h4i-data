import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { createRestApp } from '../../../src/api/rest/server';

const gqlApp = createGraphqlApp();
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

describe('GraphQL API - Volunteer History', () => {
  it('should create a volunteer history record', async () => {
    const volunteerId = await createTestVolunteer();

    const res = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateVolunteerHistoryInput!) { createVolunteerHistory(input: $input) { history_id volunteer_id action_type } }`,
        variables: {
          input: {
            volunteer_id: volunteerId,
            action_type: 'ENROLLED',
            effective_date: '2025-01-01',
          },
        },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.createVolunteerHistory).toHaveProperty('history_id');
    expect(res.body.data.createVolunteerHistory.volunteer_id).toBe(volunteerId);
  });

  it('should fetch a volunteer history record by ID', async () => {
    const volunteerId = await createTestVolunteer();
    const created = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateVolunteerHistoryInput!) { createVolunteerHistory(input: $input) { history_id } }`,
        variables: {
          input: {
            volunteer_id: volunteerId,
            action_type: 'ENROLLED',
            effective_date: '2025-01-01',
          },
        },
      });
    const id = created.body.data.createVolunteerHistory.history_id;

    const res = await request(gqlApp).post('/').send({
      query: `query ($id: ID!) { volunteerHistory(id: $id) { history_id action_type } }`,
      variables: { id },
    });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.volunteerHistory.history_id).toBe(id);
  });

  it('should fetch all volunteer history records', async () => {
    const volunteerId = await createTestVolunteer();
    await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateVolunteerHistoryInput!) { createVolunteerHistory(input: $input) { history_id } }`,
        variables: {
          input: {
            volunteer_id: volunteerId,
            action_type: 'ENROLLED',
            effective_date: '2025-01-01',
          },
        },
      });

    const res = await request(gqlApp).post('/').send({
      query: `query { volunteerHistories { history_id action_type } }`,
    });

    expect(res.body.errors).toBeUndefined();
    expect(Array.isArray(res.body.data.volunteerHistories)).toBe(true);
    expect(res.body.data.volunteerHistories.length).toBeGreaterThan(0);
  });

  it('should update a volunteer history record', async () => {
    const volunteerId = await createTestVolunteer();
    const created = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateVolunteerHistoryInput!) { createVolunteerHistory(input: $input) { history_id } }`,
        variables: {
          input: {
            volunteer_id: volunteerId,
            action_type: 'ENROLLED',
            effective_date: '2025-01-01',
          },
        },
      });
    const id = created.body.data.createVolunteerHistory.history_id;

    const res = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($id: ID!, $input: UpdateVolunteerHistoryInput!) { updateVolunteerHistory(id: $id, input: $input) { new_value_label } }`,
        variables: { id, input: { new_value_label: 'Updated label' } },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.updateVolunteerHistory.new_value_label).toBe(
      'Updated label'
    );
  });

  it('should delete a volunteer history record', async () => {
    const volunteerId = await createTestVolunteer();
    const created = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateVolunteerHistoryInput!) { createVolunteerHistory(input: $input) { history_id } }`,
        variables: {
          input: {
            volunteer_id: volunteerId,
            action_type: 'ENROLLED',
            effective_date: '2025-01-01',
          },
        },
      });
    const id = created.body.data.createVolunteerHistory.history_id;

    const res = await request(gqlApp).post('/').send({
      query: `mutation ($id: ID!) { deleteVolunteerHistory(id: $id) { history_id } }`,
      variables: { id },
    });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.deleteVolunteerHistory.history_id).toBe(id);
  });
});
