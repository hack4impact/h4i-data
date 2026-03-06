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
      last_name: 'Staff',
      primary_email: `gql.staffing.${Date.now()}.${Math.random()}@example.com`,
    });
  const id = constituentRes.body.constituent_id;
  await request(restApp)
    .post('/volunteers')
    .send({ volunteer_id: id, volunteer_class: 'COLLEGIATE' });
  return id;
};

const createTestEngagement = async () => {
  const projectRes = await request(restApp)
    .post('/projects')
    .send({ name: `Project ${Date.now()}` });
  const projectId = projectRes.body.project_id;
  const engagementRes = await request(restApp)
    .post('/project-engagements')
    .send({ project_id: projectId, status: 'ACTIVE' });
  return engagementRes.body.engagement_id;
};

describe('GraphQL API - Project Staffing', () => {
  it('should create a project staffing record', async () => {
    const volunteerId = await createTestVolunteer();
    const engagementId = await createTestEngagement();

    const res = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateProjectStaffingInput!) { createProjectStaffing(input: $input) { staffing_id volunteer_id engagement_id } }`,
        variables: {
          input: { volunteer_id: volunteerId, engagement_id: engagementId },
        },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.createProjectStaffing).toHaveProperty('staffing_id');
    expect(res.body.data.createProjectStaffing.volunteer_id).toBe(volunteerId);
  });

  it('should fetch a project staffing record by ID', async () => {
    const volunteerId = await createTestVolunteer();
    const engagementId = await createTestEngagement();
    const created = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateProjectStaffingInput!) { createProjectStaffing(input: $input) { staffing_id } }`,
        variables: {
          input: { volunteer_id: volunteerId, engagement_id: engagementId },
        },
      });
    const id = created.body.data.createProjectStaffing.staffing_id;

    const res = await request(gqlApp).post('/').send({
      query: `query ($id: ID!) { projectStaffing(id: $id) { staffing_id volunteer_id } }`,
      variables: { id },
    });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.projectStaffing.staffing_id).toBe(id);
  });

  it('should fetch all project staffing records', async () => {
    const volunteerId = await createTestVolunteer();
    const engagementId = await createTestEngagement();
    await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateProjectStaffingInput!) { createProjectStaffing(input: $input) { staffing_id } }`,
        variables: {
          input: { volunteer_id: volunteerId, engagement_id: engagementId },
        },
      });

    const res = await request(gqlApp).post('/').send({
      query: `query { projectStaffings { staffing_id } }`,
    });

    expect(res.body.errors).toBeUndefined();
    expect(Array.isArray(res.body.data.projectStaffings)).toBe(true);
    expect(res.body.data.projectStaffings.length).toBeGreaterThan(0);
  });

  it('should update a project staffing record', async () => {
    const volunteerId = await createTestVolunteer();
    const engagementId = await createTestEngagement();
    const created = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateProjectStaffingInput!) { createProjectStaffing(input: $input) { staffing_id } }`,
        variables: {
          input: {
            volunteer_id: volunteerId,
            engagement_id: engagementId,
            is_lead_contact: false,
          },
        },
      });
    const id = created.body.data.createProjectStaffing.staffing_id;

    const res = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($id: ID!, $input: UpdateProjectStaffingInput!) { updateProjectStaffing(id: $id, input: $input) { is_lead_contact } }`,
        variables: { id, input: { is_lead_contact: true } },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.updateProjectStaffing.is_lead_contact).toBe(true);
  });

  it('should delete a project staffing record', async () => {
    const volunteerId = await createTestVolunteer();
    const engagementId = await createTestEngagement();
    const created = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateProjectStaffingInput!) { createProjectStaffing(input: $input) { staffing_id } }`,
        variables: {
          input: { volunteer_id: volunteerId, engagement_id: engagementId },
        },
      });
    const id = created.body.data.createProjectStaffing.staffing_id;

    const res = await request(gqlApp).post('/').send({
      query: `mutation ($id: ID!) { deleteProjectStaffing(id: $id) { staffing_id } }`,
      variables: { id },
    });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.deleteProjectStaffing.staffing_id).toBe(id);
  });
});
