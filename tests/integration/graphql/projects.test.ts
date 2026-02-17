import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { env } from '../../../src/config/server';
import { prisma } from '../../../src/config/database';
// import { clear } from 'console';

let server: Server;
let app: express.Application;
let testProject1Id: string;
let testProject2Id: string;
let testProject3Id: string;
let testNonprofitId: string;
let testContactId: string;
let testChapterId: string;
let testLocationId: string;

beforeAll(async () => {
  app = createGraphqlApp();
  server = app.listen(env.GRAPHQL_PORT);

  // Create test data for filtering tests
  // Create location
  const location = await prisma.locations.create({
    data: {
      name: 'Test University',
      address: '123 Test St',
      subdivision_code: 'CA',
      country_code: 'US',
    },
  });
  testLocationId = location.location_id;

  // Create chapter
  const chapter = await prisma.chapters.create({
    data: {
      name: 'Test Chapter',
      founded_date: new Date('2020-01-01'),
      status_type: 'ACTIVE',
    },
  });
  testChapterId = chapter.chapter_id;

  // Create contact
  const contact = await prisma.contacts.create({
    data: {
      name: 'Test Contact',
      email: 'test@example.com',
      phone_number: '123-456-7890',
    },
  });
  testContactId = contact.contact_id;

  // Create nonprofit
  const nonprofit = await prisma.nonprofits.create({
    data: {
      name: 'Test Nonprofit',
      mission: 'Test mission',
      contact_id: testContactId,
    },
  });
  testNonprofitId = nonprofit.nonprofit_id;

  // Create projects
  const project1 = await prisma.projects.create({
    data: {
      name: 'Short Project',
      description: 'A short project',
      repo: 'repo1',
      budget: 100,
      project_type: 'DESIGN_ONLY',
    },
  });
  testProject1Id = project1.project_id;

  const project2 = await prisma.projects.create({
    data: {
      name: 'Long Project',
      description: 'A long project',
      repo: 'repo2',
      budget: 200,
      project_type: 'DEVELOP_ONLY',
    },
  });
  testProject2Id = project2.project_id;

  const project3 = await prisma.projects.create({
    data: {
      name: 'Inactive Project',
      description: 'An inactive project',
      repo: 'repo3',
      budget: 300,
      project_type: 'DESIGN_AND_DEVELOP',
    },
  });
  testProject3Id = project3.project_id;

  // Create nonprofit_chapter_project entries with different dates and statuses
  // Project 1: ACTIVE, short duration (60 days)
  await prisma.nonprofit_chapter_project.create({
    data: {
      nonprofit_id: testNonprofitId,
      chapter_id: testChapterId,
      project_id: testProject1Id,
      project_contact_id: testContactId,
      collab_contact_id: testContactId,
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-03-01'), // 60 days
      project_status: 'ACTIVE',
    },
  });

  // Project 2: ACTIVE, long duration (335 days)
  await prisma.nonprofit_chapter_project.create({
    data: {
      nonprofit_id: testNonprofitId,
      chapter_id: testChapterId,
      project_id: testProject2Id,
      project_contact_id: testContactId,
      collab_contact_id: testContactId,
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-12-01'), // 335 days
      project_status: 'ACTIVE',
    },
  });

  // Project 3: INACTIVE, medium duration (152 days)
  await prisma.nonprofit_chapter_project.create({
    data: {
      nonprofit_id: testNonprofitId,
      chapter_id: testChapterId,
      project_id: testProject3Id,
      project_contact_id: testContactId,
      collab_contact_id: testContactId,
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-06-01'), // 152 days
      project_status: 'INACTIVE',
    },
  });
});

afterAll(async () => {
  // Clean up test data
  await prisma.nonprofit_chapter_project.deleteMany({
    where: {
      project_id: {
        in: [testProject1Id, testProject2Id, testProject3Id],
      },
    },
  });
  await prisma.projects.deleteMany({
    where: {
      project_id: {
        in: [testProject1Id, testProject2Id, testProject3Id],
      },
    },
  });
  await prisma.nonprofits.delete({
    where: { nonprofit_id: testNonprofitId },
  });
  await prisma.chapters.delete({
    where: { chapter_id: testChapterId },
  });
  await prisma.contacts.delete({
    where: { contact_id: testContactId },
  });
  await prisma.locations.delete({
    where: { location_id: testLocationId },
  });

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

  describe('Project Filtering', () => {
    it('should filter projects by ACTIVE status', async () => {
      const query = `
        query FilterProjects($filter: ProjectFilterInput!) {
          projects(filter: $filter) {
            project_id
            name
            description
          }
        }
      `;
      const variables = {
        filter: {
          statuses: ['ACTIVE'],
        },
      };

      const response = await request(server)
        .post('/')
        .send({ query, variables });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      const projects = response.body.data.projects;
      expect(projects.length).toBeGreaterThanOrEqual(2);
      // Verify all returned projects are ACTIVE (we check via project names)
      const projectNames = projects.map((p: { name: string }) => p.name);
      expect(projectNames).toContain('Short Project');
      expect(projectNames).toContain('Long Project');
      expect(projectNames).not.toContain('Inactive Project');
    });

    it('should filter projects by INACTIVE status', async () => {
      const query = `
        query FilterProjects($filter: ProjectFilterInput!) {
          projects(filter: $filter) {
            project_id
            name
            description
          }
        }
      `;
      const variables = {
        filter: {
          statuses: ['INACTIVE'],
        },
      };

      const response = await request(server)
        .post('/')
        .send({ query, variables });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      const projects = response.body.data.projects;
      expect(projects.length).toBeGreaterThanOrEqual(1);
      const projectNames = projects.map((p: { name: string }) => p.name);
      expect(projectNames).toContain('Inactive Project');
    });

    it('should filter projects by multiple statuses', async () => {
      const query = `
        query FilterProjects($filter: ProjectFilterInput!) {
          projects(filter: $filter) {
            project_id
            name
            description
          }
        }
      `;
      const variables = {
        filter: {
          statuses: ['ACTIVE', 'INACTIVE'],
        },
      };

      const response = await request(server)
        .post('/')
        .send({ query, variables });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      const projects = response.body.data.projects;
      expect(projects.length).toBeGreaterThanOrEqual(3);
      const projectNames = projects.map((p: { name: string }) => p.name);
      expect(projectNames).toContain('Short Project');
      expect(projectNames).toContain('Long Project');
      expect(projectNames).toContain('Inactive Project');
    });

    it('should sort projects by longest to shortest', async () => {
      const query = `
        query SortProjects($filter: ProjectFilterInput!) {
          projects(filter: $filter) {
            project_id
            name
            description
          }
        }
      `;
      const variables = {
        filter: {
          lengthSort: 'LONGEST_TO_SHORTEST',
        },
      };

      const response = await request(server)
        .post('/')
        .send({ query, variables });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      const projects = response.body.data.projects;
      expect(projects.length).toBeGreaterThanOrEqual(3);

      // Find our test projects in the results
      // const projectMap = new Map(
      //   projects.map((p: { project_id: string; name: string }) => [
      //     p.project_id,
      //     p.name,
      //   ])
      // );

      const longProjectIndex = projects.findIndex(
        (p: { project_id: string }) => p.project_id === testProject2Id
      );
      const shortProjectIndex = projects.findIndex(
        (p: { project_id: string }) => p.project_id === testProject1Id
      );
      const inactiveProjectIndex = projects.findIndex(
        (p: { project_id: string }) => p.project_id === testProject3Id
      );

      // Long project should come before short project
      expect(longProjectIndex).toBeLessThan(shortProjectIndex);
      // Long project should come before inactive project (which is medium length)
      expect(longProjectIndex).toBeLessThan(inactiveProjectIndex);
    });

    it('should sort projects by shortest to longest', async () => {
      const query = `
        query SortProjects($filter: ProjectFilterInput!) {
          projects(filter: $filter) {
            project_id
            name
            description
          }
        }
      `;
      const variables = {
        filter: {
          lengthSort: 'SHORTEST_TO_LONGEST',
        },
      };

      const response = await request(server)
        .post('/')
        .send({ query, variables });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      const projects = response.body.data.projects;
      expect(projects.length).toBeGreaterThanOrEqual(3);

      // Find our test projects in the results
      const longProjectIndex = projects.findIndex(
        (p: { project_id: string }) => p.project_id === testProject2Id
      );
      const shortProjectIndex = projects.findIndex(
        (p: { project_id: string }) => p.project_id === testProject1Id
      );
      const inactiveProjectIndex = projects.findIndex(
        (p: { project_id: string }) => p.project_id === testProject3Id
      );

      // Short project should come before long project
      expect(shortProjectIndex).toBeLessThan(longProjectIndex);
      // Short project should come before inactive project
      expect(shortProjectIndex).toBeLessThan(inactiveProjectIndex);
    });

    it('should filter by status and sort by length together', async () => {
      const query = `
        query FilterAndSortProjects($filter: ProjectFilterInput!) {
          projects(filter: $filter) {
            project_id
            name
            description
          }
        }
      `;
      const variables = {
        filter: {
          statuses: ['ACTIVE'],
          lengthSort: 'LONGEST_TO_SHORTEST',
        },
      };

      const response = await request(server)
        .post('/')
        .send({ query, variables });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      const projects = response.body.data.projects;
      expect(projects.length).toBeGreaterThanOrEqual(2);

      // Verify only ACTIVE projects are returned
      const projectNames = projects.map((p: { name: string }) => p.name);
      expect(projectNames).toContain('Long Project');
      expect(projectNames).toContain('Short Project');
      expect(projectNames).not.toContain('Inactive Project');

      // Verify sorting: Long Project should come before Short Project
      const longProjectIndex = projects.findIndex(
        (p: { project_id: string }) => p.project_id === testProject2Id
      );
      const shortProjectIndex = projects.findIndex(
        (p: { project_id: string }) => p.project_id === testProject1Id
      );
      expect(longProjectIndex).toBeLessThan(shortProjectIndex);
    });

    it('should return all projects when no filter is provided (backward compatibility)', async () => {
      const query = `
        query AllProjects {
          projects {
            project_id
            name
            description
          }
        }
      `;

      const response = await request(server).post('/').send({ query });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      const projects = response.body.data.projects;
      expect(projects.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle invalid status values gracefully', async () => {
      const query = `
        query FilterProjects($filter: ProjectFilterInput!) {
          projects(filter: $filter) {
            project_id
            name
          }
        }
      `;
      const variables = {
        filter: {
          statuses: ['INVALID_STATUS', 'ACTIVE'],
        },
      };

      const response = await request(server)
        .post('/')
        .send({ query, variables });

      expect(response.status).toBe(200);
      // Should only filter by valid status (ACTIVE)
      expect(response.body.errors).toBeUndefined();
      const projects = response.body.data.projects;
      expect(projects.length).toBeGreaterThanOrEqual(2);
    });
  });
});
