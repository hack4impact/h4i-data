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
    .send({ name: `Project ${Date.now()}.${Math.random()}` });
  const projectId = projectRes.body.project_id;
  const engagementRes = await request(restApp)
    .post('/project-engagements')
    .send({ project_id: projectId, status: 'ACTIVE' });
  return engagementRes.body.engagement_id;
};

const createTestStaffing = async (
  volunteerId: string,
  engagementId: string
) => {
  const mutation = `
    mutation CreateProjectStaffing($input: CreateProjectStaffingInput!) {
      createProjectStaffing(input: $input) {
        staffing_id
        volunteer_id
        engagement_id
      }
    }
  `;
  const response = await request(app)
    .post('/')
    .send({
      query: mutation,
      variables: {
        input: { volunteer_id: volunteerId, engagement_id: engagementId },
      },
    });
  return response.body.data.createProjectStaffing;
};

describe('GraphQL API - Project Staffing', () => {
  it('should create a new project staffing record via mutation', async () => {
    // Arrange
    const volunteerId = await createTestVolunteer();
    const engagementId = await createTestEngagement();

    // Act
    const mutation = `
      mutation CreateProjectStaffing($input: CreateProjectStaffingInput!) {
        createProjectStaffing(input: $input) {
          staffing_id
          volunteer_id
          engagement_id
          is_lead_contact
        }
      }
    `;
    const variables = {
      input: {
        volunteer_id: volunteerId,
        engagement_id: engagementId,
        is_lead_contact: true,
      },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const staffing = response.body.data.createProjectStaffing;
    expect(staffing).toHaveProperty('staffing_id');
    expect(staffing.volunteer_id).toBe(volunteerId);
    expect(staffing.engagement_id).toBe(engagementId);
    expect(staffing.is_lead_contact).toBe(true);
  });

  it('should fetch a project staffing record by ID via query', async () => {
    // Arrange
    const volunteerId = await createTestVolunteer();
    const engagementId = await createTestEngagement();
    const created = await createTestStaffing(volunteerId, engagementId);

    // Act
    const query = `
      query ProjectStaffing($id: ID!) {
        projectStaffing(id: $id) {
          staffing_id
          volunteer_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query, variables: { id: created.staffing_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.projectStaffing.staffing_id).toBe(
      created.staffing_id
    );
  });

  it('should return null for a non-existent project staffing ID', async () => {
    // Act
    const query = `
      query {
        projectStaffing(id: "00000000-0000-0000-0000-000000000000") {
          staffing_id
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.projectStaffing).toBeNull();
  });

  it('should fetch all project staffing records via query', async () => {
    // Arrange
    const volunteerId = await createTestVolunteer();
    const engagementId = await createTestEngagement();
    await createTestStaffing(volunteerId, engagementId);

    // Act
    const query = `query { projectStaffings { staffing_id } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.projectStaffings)).toBe(true);
    expect(response.body.data.projectStaffings.length).toBeGreaterThan(0);
  });

  it('should update a project staffing record via mutation', async () => {
    // Arrange
    const volunteerId = await createTestVolunteer();
    const engagementId = await createTestEngagement();
    const created = await createTestStaffing(volunteerId, engagementId);

    // Act
    const mutation = `
      mutation UpdateProjectStaffing($id: ID!, $input: UpdateProjectStaffingInput!) {
        updateProjectStaffing(id: $id, input: $input) {
          staffing_id
          is_lead_contact
        }
      }
    `;
    const variables = {
      id: created.staffing_id,
      input: { is_lead_contact: true },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateProjectStaffing.is_lead_contact).toBe(true);
  });

  it('should return errors when updating a non-existent project staffing record', async () => {
    // Act
    const mutation = `
      mutation UpdateProjectStaffing($id: ID!, $input: UpdateProjectStaffingInput!) {
        updateProjectStaffing(id: $id, input: $input) {
          staffing_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: {
          id: '00000000-0000-0000-0000-000000000000',
          input: { is_lead_contact: true },
        },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return a validation error for an invalid project staffing input', async () => {
    // Arrange
    const volunteerId = await createTestVolunteer();
    const engagementId = await createTestEngagement();
    const created = await createTestStaffing(volunteerId, engagementId);

    // Act
    const mutation = `
      mutation UpdateProjectStaffing($id: ID!, $input: UpdateProjectStaffingInput!) {
        updateProjectStaffing(id: $id, input: $input) {
          staffing_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: {
          id: created.staffing_id,
          input: { is_lead_contact: 'not-a-boolean' },
        },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return errors when deleting a non-existent project staffing record', async () => {
    // Act
    const mutation = `
      mutation DeleteProjectStaffing($id: ID!) {
        deleteProjectStaffing(id: $id) {
          staffing_id
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

  it('should delete a project staffing record via mutation', async () => {
    // Arrange
    const volunteerId = await createTestVolunteer();
    const engagementId = await createTestEngagement();
    const created = await createTestStaffing(volunteerId, engagementId);

    // Act
    const mutation = `
      mutation DeleteProjectStaffing($id: ID!) {
        deleteProjectStaffing(id: $id) {
          staffing_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables: { id: created.staffing_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteProjectStaffing.staffing_id).toBe(
      created.staffing_id
    );

    // Verify it's gone
    const verifyQuery = `query { projectStaffing(id: "${created.staffing_id}") { staffing_id } }`;
    const verifyResponse = await request(app)
      .post('/')
      .send({ query: verifyQuery });
    expect(verifyResponse.body.data.projectStaffing).toBeNull();
  });
});
