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

describe('GraphQL API - Project Engagements', () => {
  it('should create a project engagement', async () => {
    const projectId = await createTestProject();

    const res = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateProjectEngagementInput!) { createProjectEngagement(input: $input) { engagement_id project_id status } }`,
        variables: {
          input: {
            project_id: projectId,
            status: 'ACTIVE',
            domain: 'FULL_STACK',
          },
        },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.createProjectEngagement).toHaveProperty(
      'engagement_id'
    );
    expect(res.body.data.createProjectEngagement.project_id).toBe(projectId);
  });

  it('should fetch a project engagement by ID', async () => {
    const projectId = await createTestProject();
    const created = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateProjectEngagementInput!) { createProjectEngagement(input: $input) { engagement_id } }`,
        variables: { input: { project_id: projectId } },
      });
    const id = created.body.data.createProjectEngagement.engagement_id;

    const res = await request(gqlApp).post('/').send({
      query: `query ($id: ID!) { projectEngagement(id: $id) { engagement_id project_id } }`,
      variables: { id },
    });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.projectEngagement.engagement_id).toBe(id);
  });

  it('should fetch all project engagements', async () => {
    const projectId = await createTestProject();
    await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateProjectEngagementInput!) { createProjectEngagement(input: $input) { engagement_id } }`,
        variables: { input: { project_id: projectId } },
      });

    const res = await request(gqlApp).post('/').send({
      query: `query { projectEngagements { engagement_id } }`,
    });

    expect(res.body.errors).toBeUndefined();
    expect(Array.isArray(res.body.data.projectEngagements)).toBe(true);
    expect(res.body.data.projectEngagements.length).toBeGreaterThan(0);
  });

  it('should update a project engagement', async () => {
    const projectId = await createTestProject();
    const created = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateProjectEngagementInput!) { createProjectEngagement(input: $input) { engagement_id } }`,
        variables: { input: { project_id: projectId, status: 'ACTIVE' } },
      });
    const id = created.body.data.createProjectEngagement.engagement_id;

    const res = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($id: ID!, $input: UpdateProjectEngagementInput!) { updateProjectEngagement(id: $id, input: $input) { status } }`,
        variables: { id, input: { status: 'COMPLETED' } },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.updateProjectEngagement.status).toBe('COMPLETED');
  });

  it('should delete a project engagement', async () => {
    const projectId = await createTestProject();
    const created = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateProjectEngagementInput!) { createProjectEngagement(input: $input) { engagement_id } }`,
        variables: { input: { project_id: projectId } },
      });
    const id = created.body.data.createProjectEngagement.engagement_id;

    const res = await request(gqlApp).post('/').send({
      query: `mutation ($id: ID!) { deleteProjectEngagement(id: $id) { engagement_id } }`,
      variables: { id },
    });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.deleteProjectEngagement.engagement_id).toBe(id);
  });
});
