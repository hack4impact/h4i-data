import request from 'supertest';
import { server } from './testServer';
import { startTestServer, closeTestServer } from './testServer';
import { prisma } from '../../../src/config/database';

// beforeAll runs once before all tests
beforeAll(() => {
  startTestServer();
});

// afterAll runs once after all tests
afterAll(async () => {
  // Clean up the database by deleting the created project
  if (createdProjectId) {
    await prisma.projects.delete({ where: { project_id: createdProjectId } });
  }

  await closeTestServer();
});

// Hold the ID of the project we create, so we can clean it up
let createdProjectId: string;

describe('REST API - /projects', () => {
  it('should create a new project via POST', async () => {
    const response = await request(server).post('/projects').send({
      name: 'REST Integration Test Project',
      repo: 'REPO URL',
    });

    // Assertions
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('project_id');
    expect(response.body.name).toBe('REST Integration Test Project');
    expect(response.body.repo).toBe('REPO URL');

    // Store the ID for cleanup and for the next test
    createdProjectId = response.body.project_id;
  });

  it('should fetch a project by its ID via GET', async () => {
    // This test relies on the project created in the previous test
    expect(createdProjectId).toBeDefined();

    const response = await request(server).get(`/projects/${createdProjectId}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.project_id).toBe(createdProjectId);
    expect(response.body.name).toBe('REST Integration Test Project');
  });

  it('should return 404 for a non-existent project ID', async () => {
    const response = await request(server).get(
      '/projects/00000000-0000-0000-0000-000000000000'
    );
    expect(response.status).toBe(404);
  });
});
