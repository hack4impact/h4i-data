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
      last_name: 'Officer',
      primary_email: `gql.oa.${Date.now()}.${Math.random()}@example.com`,
    });
  const id = constituentRes.body.constituent_id;
  await request(restApp)
    .post('/volunteers')
    .send({ volunteer_id: id, volunteer_class: 'COLLEGIATE' });
  return id;
};

const createTestOfficerRole = async () => {
  const res = await request(restApp)
    .post('/officer-roles')
    .send({ name: `Role ${Date.now()}.${Math.random()}` });
  return res.body.role_id;
};

const createTestChapter = async () => {
  const res = await request(restApp)
    .post('/chapters')
    .send({ name: `Chapter ${Date.now()}.${Math.random()}` });
  return res.body.chapter_id;
};

const createTestAssignment = async (
  volunteerId: string,
  roleId: string,
  chapterId: string
) => {
  const mutation = `
    mutation CreateOfficerAssignment($input: CreateOfficerAssignmentInput!) {
      createOfficerAssignment(input: $input) {
        assignment_id
        volunteer_id
        role_id
        chapter_id
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
          role_id: roleId,
          chapter_id: chapterId,
        },
      },
    });
  return response.body.data.createOfficerAssignment;
};

describe('GraphQL API - Officer Assignments', () => {
  it('should create a new officer assignment via mutation', async () => {
    // Arrange
    const volunteerId = await createTestVolunteer();
    const roleId = await createTestOfficerRole();
    const chapterId = await createTestChapter();

    // Act
    const mutation = `
      mutation CreateOfficerAssignment($input: CreateOfficerAssignmentInput!) {
        createOfficerAssignment(input: $input) {
          assignment_id
          volunteer_id
          role_id
          chapter_id
        }
      }
    `;
    const variables = {
      input: {
        volunteer_id: volunteerId,
        role_id: roleId,
        chapter_id: chapterId,
      },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const assignment = response.body.data.createOfficerAssignment;
    expect(assignment).toHaveProperty('assignment_id');
    expect(assignment.volunteer_id).toBe(volunteerId);
    expect(assignment.role_id).toBe(roleId);
  });

  it('should fetch an officer assignment by ID via query', async () => {
    // Arrange
    const volunteerId = await createTestVolunteer();
    const roleId = await createTestOfficerRole();
    const chapterId = await createTestChapter();
    const created = await createTestAssignment(volunteerId, roleId, chapterId);

    // Act
    const query = `
      query OfficerAssignment($id: ID!) {
        officerAssignment(id: $id) {
          assignment_id
          volunteer_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query, variables: { id: created.assignment_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.officerAssignment.assignment_id).toBe(
      created.assignment_id
    );
  });

  it('should return null for a non-existent officer assignment ID', async () => {
    // Act
    const query = `
      query {
        officerAssignment(id: "00000000-0000-0000-0000-000000000000") {
          assignment_id
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.officerAssignment).toBeNull();
  });

  it('should fetch all officer assignments via query', async () => {
    // Arrange
    const volunteerId = await createTestVolunteer();
    const roleId = await createTestOfficerRole();
    const chapterId = await createTestChapter();
    await createTestAssignment(volunteerId, roleId, chapterId);

    // Act
    const query = `query { officerAssignments { assignment_id } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.officerAssignments)).toBe(true);
    expect(response.body.data.officerAssignments.length).toBeGreaterThan(0);
  });

  it('should update an officer assignment via mutation', async () => {
    // Arrange
    const volunteerId = await createTestVolunteer();
    const roleId = await createTestOfficerRole();
    const chapterId = await createTestChapter();
    const created = await createTestAssignment(volunteerId, roleId, chapterId);

    // Act
    const mutation = `
      mutation UpdateOfficerAssignment($id: ID!, $input: UpdateOfficerAssignmentInput!) {
        updateOfficerAssignment(id: $id, input: $input) {
          assignment_id
          end_date
        }
      }
    `;
    const variables = {
      id: created.assignment_id,
      input: { end_date: '2025-12-31' },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateOfficerAssignment.end_date).toBeDefined();
  });

  it('should return errors when updating a non-existent officer assignment', async () => {
    // Act
    const mutation = `
      mutation UpdateOfficerAssignment($id: ID!, $input: UpdateOfficerAssignmentInput!) {
        updateOfficerAssignment(id: $id, input: $input) {
          assignment_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: {
          id: '00000000-0000-0000-0000-000000000000',
          input: { end_date: '2025-12-31' },
        },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return a validation error for an invalid officer assignment input', async () => {
    // Arrange
    const volunteerId = await createTestVolunteer();
    const roleId = await createTestOfficerRole();
    const chapterId = await createTestChapter();
    const created = await createTestAssignment(volunteerId, roleId, chapterId);

    // Act
    const mutation = `
      mutation UpdateOfficerAssignment($id: ID!, $input: UpdateOfficerAssignmentInput!) {
        updateOfficerAssignment(id: $id, input: $input) {
          assignment_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: {
          id: created.assignment_id,
          input: { end_date: 'not-a-date' },
        },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return errors when deleting a non-existent officer assignment', async () => {
    // Act
    const mutation = `
      mutation DeleteOfficerAssignment($id: ID!) {
        deleteOfficerAssignment(id: $id) {
          assignment_id
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

  it('should delete an officer assignment via mutation', async () => {
    // Arrange
    const volunteerId = await createTestVolunteer();
    const roleId = await createTestOfficerRole();
    const chapterId = await createTestChapter();
    const created = await createTestAssignment(volunteerId, roleId, chapterId);

    // Act
    const mutation = `
      mutation DeleteOfficerAssignment($id: ID!) {
        deleteOfficerAssignment(id: $id) {
          assignment_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables: { id: created.assignment_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteOfficerAssignment.assignment_id).toBe(
      created.assignment_id
    );

    // Verify it's gone
    const verifyQuery = `query { officerAssignment(id: "${created.assignment_id}") { assignment_id } }`;
    const verifyResponse = await request(app)
      .post('/')
      .send({ query: verifyQuery });
    expect(verifyResponse.body.data.officerAssignment).toBeNull();
  });
});
