import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { createRestApp } from '../../../src/api/rest/server';

const app = createGraphqlApp();
const restApp = createRestApp();

const createTestProject = async () => {
  const res = await request(restApp)
    .post('/projects')
    .send({ name: `Project ${Date.now()}.${Math.random()}` });
  return res.body.project_id;
};

const createTestDeliverable = async (projectId: string, label: string) => {
  const mutation = `
    mutation CreateProjectDeliverable($input: CreateProjectDeliverableInput!) {
      createProjectDeliverable(input: $input) {
        deliverable_id
        project_id
        label
      }
    }
  `;
  const response = await request(app)
    .post('/')
    .send({
      query: mutation,
      variables: { input: { project_id: projectId, label } },
    });
  return response.body.data.createProjectDeliverable;
};

describe('GraphQL API - Project Deliverables', () => {
  it('should create a new project deliverable via mutation', async () => {
    // Arrange
    const projectId = await createTestProject();

    // Act
    const mutation = `
      mutation CreateProjectDeliverable($input: CreateProjectDeliverableInput!) {
        createProjectDeliverable(input: $input) {
          deliverable_id
          project_id
          label
          category
        }
      }
    `;
    const variables = {
      input: {
        project_id: projectId,
        label: 'Source Code',
        url: 'https://github.com/org/repo',
        category: 'CODE',
      },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const deliverable = response.body.data.createProjectDeliverable;
    expect(deliverable).toHaveProperty('deliverable_id');
    expect(deliverable.project_id).toBe(projectId);
    expect(deliverable.label).toBe('Source Code');
    expect(deliverable.category).toBe('CODE');
  });

  it('should fetch a project deliverable by ID via query', async () => {
    // Arrange
    const projectId = await createTestProject();
    const created = await createTestDeliverable(projectId, 'Design Spec');

    // Act
    const query = `
      query ProjectDeliverable($id: ID!) {
        projectDeliverable(id: $id) {
          deliverable_id
          label
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query, variables: { id: created.deliverable_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.projectDeliverable.deliverable_id).toBe(
      created.deliverable_id
    );
  });

  it('should return null for a non-existent project deliverable ID', async () => {
    // Act
    const query = `
      query {
        projectDeliverable(id: "00000000-0000-0000-0000-000000000000") {
          deliverable_id
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.projectDeliverable).toBeNull();
  });

  it('should fetch all project deliverables via query', async () => {
    // Arrange
    const projectId = await createTestProject();
    await createTestDeliverable(projectId, 'Documentation');

    // Act
    const query = `query { projectDeliverables { deliverable_id } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.projectDeliverables)).toBe(true);
    expect(response.body.data.projectDeliverables.length).toBeGreaterThan(0);
  });

  it('should update a project deliverable via mutation', async () => {
    // Arrange
    const projectId = await createTestProject();
    const created = await createTestDeliverable(projectId, 'Original Label');

    // Act
    const mutation = `
      mutation UpdateProjectDeliverable($id: ID!, $input: UpdateProjectDeliverableInput!) {
        updateProjectDeliverable(id: $id, input: $input) {
          deliverable_id
          label
        }
      }
    `;
    const variables = {
      id: created.deliverable_id,
      input: { label: 'Updated Label' },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateProjectDeliverable.label).toBe(
      'Updated Label'
    );
  });

  it('should return errors when updating a non-existent project deliverable', async () => {
    // Act
    const mutation = `
      mutation UpdateProjectDeliverable($id: ID!, $input: UpdateProjectDeliverableInput!) {
        updateProjectDeliverable(id: $id, input: $input) {
          deliverable_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: {
          id: '00000000-0000-0000-0000-000000000000',
          input: { label: 'Updated Label' },
        },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return a validation error for an invalid project deliverable input', async () => {
    // Arrange
    const projectId = await createTestProject();
    const created = await createTestDeliverable(projectId, 'Original Label');

    // Act
    const mutation = `
      mutation UpdateProjectDeliverable($id: ID!, $input: UpdateProjectDeliverableInput!) {
        updateProjectDeliverable(id: $id, input: $input) {
          deliverable_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: { id: created.deliverable_id, input: { url: 'not-a-url' } },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return errors when deleting a non-existent project deliverable', async () => {
    // Act
    const mutation = `
      mutation DeleteProjectDeliverable($id: ID!) {
        deleteProjectDeliverable(id: $id) {
          deliverable_id
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

  it('should delete a project deliverable via mutation', async () => {
    // Arrange
    const projectId = await createTestProject();
    const created = await createTestDeliverable(projectId, 'To Delete');

    // Act
    const mutation = `
      mutation DeleteProjectDeliverable($id: ID!) {
        deleteProjectDeliverable(id: $id) {
          deliverable_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables: { id: created.deliverable_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteProjectDeliverable.deliverable_id).toBe(
      created.deliverable_id
    );

    // Verify it's gone
    const verifyQuery = `query { projectDeliverable(id: "${created.deliverable_id}") { deliverable_id } }`;
    const verifyResponse = await request(app)
      .post('/')
      .send({ query: verifyQuery });
    expect(verifyResponse.body.data.projectDeliverable).toBeNull();
  });
});
