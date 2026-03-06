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
    .send({ name: `Role ${Date.now()}` });
  return res.body.role_id;
};

const createTestChapter = async () => {
  const res = await request(restApp)
    .post('/chapters')
    .send({ name: `Chapter ${Date.now()}` });
  return res.body.chapter_id;
};

describe('GraphQL API - Officer Assignments', () => {
  it('should create an officer assignment', async () => {
    const volunteerId = await createTestVolunteer();
    const roleId = await createTestOfficerRole();
    const chapterId = await createTestChapter();

    const res = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateOfficerAssignmentInput!) { createOfficerAssignment(input: $input) { assignment_id volunteer_id role_id } }`,
        variables: {
          input: {
            volunteer_id: volunteerId,
            role_id: roleId,
            chapter_id: chapterId,
          },
        },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.createOfficerAssignment).toHaveProperty(
      'assignment_id'
    );
    expect(res.body.data.createOfficerAssignment.volunteer_id).toBe(
      volunteerId
    );
  });

  it('should fetch an officer assignment by ID', async () => {
    const volunteerId = await createTestVolunteer();
    const roleId = await createTestOfficerRole();
    const chapterId = await createTestChapter();
    const created = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateOfficerAssignmentInput!) { createOfficerAssignment(input: $input) { assignment_id } }`,
        variables: {
          input: {
            volunteer_id: volunteerId,
            role_id: roleId,
            chapter_id: chapterId,
          },
        },
      });
    const id = created.body.data.createOfficerAssignment.assignment_id;

    const res = await request(gqlApp).post('/').send({
      query: `query ($id: ID!) { officerAssignment(id: $id) { assignment_id volunteer_id } }`,
      variables: { id },
    });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.officerAssignment.assignment_id).toBe(id);
  });

  it('should fetch all officer assignments', async () => {
    const volunteerId = await createTestVolunteer();
    const roleId = await createTestOfficerRole();
    const chapterId = await createTestChapter();
    await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateOfficerAssignmentInput!) { createOfficerAssignment(input: $input) { assignment_id } }`,
        variables: {
          input: {
            volunteer_id: volunteerId,
            role_id: roleId,
            chapter_id: chapterId,
          },
        },
      });

    const res = await request(gqlApp).post('/').send({
      query: `query { officerAssignments { assignment_id } }`,
    });

    expect(res.body.errors).toBeUndefined();
    expect(Array.isArray(res.body.data.officerAssignments)).toBe(true);
    expect(res.body.data.officerAssignments.length).toBeGreaterThan(0);
  });

  it('should update an officer assignment', async () => {
    const volunteerId = await createTestVolunteer();
    const roleId = await createTestOfficerRole();
    const chapterId = await createTestChapter();
    const created = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateOfficerAssignmentInput!) { createOfficerAssignment(input: $input) { assignment_id } }`,
        variables: {
          input: {
            volunteer_id: volunteerId,
            role_id: roleId,
            chapter_id: chapterId,
          },
        },
      });
    const id = created.body.data.createOfficerAssignment.assignment_id;

    const res = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($id: ID!, $input: UpdateOfficerAssignmentInput!) { updateOfficerAssignment(id: $id, input: $input) { assignment_id end_date } }`,
        variables: { id, input: { end_date: '2025-12-31' } },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.updateOfficerAssignment.assignment_id).toBe(id);
  });

  it('should delete an officer assignment', async () => {
    const volunteerId = await createTestVolunteer();
    const roleId = await createTestOfficerRole();
    const chapterId = await createTestChapter();
    const created = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateOfficerAssignmentInput!) { createOfficerAssignment(input: $input) { assignment_id } }`,
        variables: {
          input: {
            volunteer_id: volunteerId,
            role_id: roleId,
            chapter_id: chapterId,
          },
        },
      });
    const id = created.body.data.createOfficerAssignment.assignment_id;

    const res = await request(gqlApp).post('/').send({
      query: `mutation ($id: ID!) { deleteOfficerAssignment(id: $id) { assignment_id } }`,
      variables: { id },
    });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.deleteOfficerAssignment.assignment_id).toBe(id);
  });
});
