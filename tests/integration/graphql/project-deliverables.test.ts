import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { createRestApp } from '../../../src/api/rest/server';

const gqlApp = createGraphqlApp();
const restApp = createRestApp();

const createTestProject = async () => {
  const res = await request(restApp)
    .post('/projects')
    .send({ name: `Project ${Date.now()}` });
  return res.body.project_id;
};

describe('GraphQL API - Project Deliverables', () => {
  it('should create a project deliverable', async () => {
    const projectId = await createTestProject();

    const res = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateProjectDeliverableInput!) { createProjectDeliverable(input: $input) { deliverable_id project_id label } }`,
        variables: {
          input: {
            project_id: projectId,
            label: 'Source Code',
            url: 'https://github.com/org/repo',
            category: 'REPO',
          },
        },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.createProjectDeliverable).toHaveProperty(
      'deliverable_id'
    );
    expect(res.body.data.createProjectDeliverable.project_id).toBe(projectId);
  });

  it('should fetch a project deliverable by ID', async () => {
    const projectId = await createTestProject();
    const created = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateProjectDeliverableInput!) { createProjectDeliverable(input: $input) { deliverable_id } }`,
        variables: { input: { project_id: projectId, label: 'Design Spec' } },
      });
    const id = created.body.data.createProjectDeliverable.deliverable_id;

    const res = await request(gqlApp).post('/').send({
      query: `query ($id: ID!) { projectDeliverable(id: $id) { deliverable_id label } }`,
      variables: { id },
    });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.projectDeliverable.deliverable_id).toBe(id);
  });

  it('should fetch all project deliverables', async () => {
    const projectId = await createTestProject();
    await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateProjectDeliverableInput!) { createProjectDeliverable(input: $input) { deliverable_id } }`,
        variables: { input: { project_id: projectId } },
      });

    const res = await request(gqlApp).post('/').send({
      query: `query { projectDeliverables { deliverable_id } }`,
    });

    expect(res.body.errors).toBeUndefined();
    expect(Array.isArray(res.body.data.projectDeliverables)).toBe(true);
    expect(res.body.data.projectDeliverables.length).toBeGreaterThan(0);
  });

  it('should update a project deliverable', async () => {
    const projectId = await createTestProject();
    const created = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateProjectDeliverableInput!) { createProjectDeliverable(input: $input) { deliverable_id } }`,
        variables: { input: { project_id: projectId, label: 'Original' } },
      });
    const id = created.body.data.createProjectDeliverable.deliverable_id;

    const res = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($id: ID!, $input: UpdateProjectDeliverableInput!) { updateProjectDeliverable(id: $id, input: $input) { label } }`,
        variables: { id, input: { label: 'Updated Label' } },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.updateProjectDeliverable.label).toBe('Updated Label');
  });

  it('should delete a project deliverable', async () => {
    const projectId = await createTestProject();
    const created = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateProjectDeliverableInput!) { createProjectDeliverable(input: $input) { deliverable_id } }`,
        variables: { input: { project_id: projectId } },
      });
    const id = created.body.data.createProjectDeliverable.deliverable_id;

    const res = await request(gqlApp).post('/').send({
      query: `mutation ($id: ID!) { deleteProjectDeliverable(id: $id) { deliverable_id } }`,
      variables: { id },
    });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.deleteProjectDeliverable.deliverable_id).toBe(id);
  });
});
