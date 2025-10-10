import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { env } from '../../../src/config/server';

let server: Server;
let app: express.Application;

beforeAll(() => {
  app = createGraphqlApp();
  server = app.listen(env.GRAPHQL_PORT);
});

afterAll(() => {
  server.close();
});

describe('GraphQL API - Projects', () => {
  it('should create a new project via mutation', async () => {
    const mutation = `
      mutation CreateProject($input: CreateProjectInput!) {
        createProject(input: $input) {
          project_id
          name
          description
          repo
          budget
          project_type
        }
      }
    `;
    const variables = {
      input: {
        name: 'GraphQL Integration Test Project',
        description: 'This is a test description for project',
        repo: 'test repo link',
        budget: 100,
        project_type: 'DESIGN_ONLY',
      },
    };

    const response = await request(server)
      .post('/')
      .send({ query: mutation, variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const project = response.body.data.createProject;
    expect(project).toHaveProperty('project_id');
    expect(project.name).toBe('GraphQL Integration Test Project');
  });

  it('should create and fetch a project by its ID via query', async () => {
    // Create a project for this specific test
    const createMutation = `
      mutation CreateProject($input: CreateProjectInput!) {
        createProject(input: $input) {
          project_id
          name
          description
          repo
          budget
          project_type
        }
      }
    `;
    const createVariables = {
      input: {
        name: 'Test Project for Query',
        description: 'Test description for project query',
        repo: 'test repo link project query',
        budget: 100,
        project_type: 'DESIGN_ONLY',
      },
    };

    const createResponse = await request(server)
      .post('/')
      .send({ query: createMutation, variables: createVariables });

    expect(createResponse.status).toBe(200);
    expect(createResponse.body.errors).toBeUndefined();
    const projectId = createResponse.body.data.createProject.project_id;

    // Now fetch it
    const query = `
      query Project($id: ID!) {
        project(id: $id) {
          project_id
          name
          description
          repo
          budget
          project_type
        }
      }
    `;
    const variables = { id: projectId };

    const response = await request(server).post('/').send({ query, variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const project = response.body.data.project;
    expect(project.project_id).toBe(projectId);
    expect(project.name).toBe('Test Project for Query');
  });
});
