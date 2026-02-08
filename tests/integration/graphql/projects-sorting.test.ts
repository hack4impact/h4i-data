import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { env } from '../../../src/config/server';
import { prisma } from '../../../src/config/database';

interface ProjectResponse {
  project_id: string;
  name: string;
}

let server: Server;
let app: express.Application;
let contactId: string;
let chapterId: string;
let nonprofitId: string;
let project1Id: string;
let project2Id: string;
let project3Id: string;

beforeAll(async () => {
  app = createGraphqlApp();
  server = app.listen(env.GRAPHQL_PORT);

  // Create contact for nonprofit_chapter_project
  const contactMutation = `mutation CreateContact($input: CreateContactInput!) { createContact(input: $input) { contact_id } }`;
  const contactResponse = await request(server)
    .post('/')
    .send({
      query: contactMutation,
      variables: {
        input: {
          name: 'Projects Sorting Test Contact',
          email: 'projects-sorting@test.com',
          phone_number: '123-456-7890',
        },
      },
    });
  contactId = contactResponse.body.data.createContact.contact_id;

  // Create nonprofit for nonprofit_chapter_project
  const createNonprofitMutation = `mutation CreateNonprofit($input: CreateNonprofitInput!) { createNonprofit(input: $input) { nonprofit_id } }`;
  const npResponse = await request(server)
    .post('/')
    .send({
      query: createNonprofitMutation,
      variables: {
        input: {
          name: 'Projects Sorting Test Nonprofit',
          mission: 'Test mission',
          contact_id: contactId,
        },
      },
    });
  nonprofitId = npResponse.body.data.createNonprofit.nonprofit_id;
});

// Recreate chapter, projects, and nonprofit_chapter_project records before each test
beforeEach(async () => {
  // Create chapter
  const chapterMutation = `mutation CreateChapter($input: CreateChapterInput!) { createChapter(input: $input) { chapter_id } }`;
  const chapterResponse = await request(server)
    .post('/')
    .send({
      query: chapterMutation,
      variables: {
        input: {
          name: 'Projects Filter Chapter',
          founded_date: '2020-01-01T00:00:00.000Z',
          status_type: 'ACTIVE',
        },
      },
    });
  chapterId = chapterResponse.body.data.createChapter.chapter_id;

  // Create three projects
  const projectMutation = `mutation CreateProject($input: CreateProjectInput!) { createProject(input: $input) { project_id } }`;
  const p1 = await request(server)
    .post('/')
    .send({
      query: projectMutation,
      variables: {
        input: {
          name: 'Old Project',
          repo: 'https://github.com/test/old',
          project_type: 'DESIGN_AND_DEVELOP',
        },
      },
    });
  project1Id = p1.body.data.createProject.project_id;

  const p2 = await request(server)
    .post('/')
    .send({
      query: projectMutation,
      variables: {
        input: {
          name: 'Middle Project',
          repo: 'https://github.com/test/middle',
          project_type: 'DESIGN_AND_DEVELOP',
        },
      },
    });
  project2Id = p2.body.data.createProject.project_id;

  const p3 = await request(server)
    .post('/')
    .send({
      query: projectMutation,
      variables: {
        input: {
          name: 'Newest Project',
          repo: 'https://github.com/test/newest',
          project_type: 'DESIGN_AND_DEVELOP',
        },
      },
    });
  project3Id = p3.body.data.createProject.project_id;

  // Create nonprofit_chapter_project records with different start_dates
  await prisma.nonprofit_chapter_project.create({
    data: {
      nonprofit_id: nonprofitId,
      chapter_id: chapterId,
      project_id: project1Id,
      project_contact_id: contactId,
      collab_contact_id: contactId,
      start_date: new Date('2022-01-01'),
      end_date: new Date('2022-12-31'),
      project_status: 'INACTIVE',
    },
  });
  await prisma.nonprofit_chapter_project.create({
    data: {
      nonprofit_id: nonprofitId,
      chapter_id: chapterId,
      project_id: project2Id,
      project_contact_id: contactId,
      collab_contact_id: contactId,
      start_date: new Date('2023-06-01'),
      end_date: new Date('2024-06-30'),
      project_status: 'INACTIVE',
    },
  });
  await prisma.nonprofit_chapter_project.create({
    data: {
      nonprofit_id: nonprofitId,
      chapter_id: chapterId,
      project_id: project3Id,
      project_contact_id: contactId,
      collab_contact_id: contactId,
      start_date: new Date('2024-12-01'),
      end_date: null,
      project_status: 'ACTIVE',
    },
  });
});

afterAll(async () => {
  const projectIds = [project1Id, project2Id, project3Id].filter(
    (id) => id !== undefined
  );
  if (projectIds.length > 0) {
    await prisma.nonprofit_chapter_project.deleteMany({
      where: { project_id: { in: projectIds } },
    });
    await prisma.projects.deleteMany({
      where: { project_id: { in: projectIds } },
    });
  }
  if (chapterId) {
    await prisma.chapters.deleteMany({ where: { chapter_id: chapterId } });
  }
  if (nonprofitId) {
    await prisma.nonprofit_chapter_project.deleteMany({
      where: { nonprofit_id: nonprofitId },
    });
    await prisma.nonprofits.deleteMany({
      where: { nonprofit_id: nonprofitId },
    });
  }
  if (contactId) {
    await prisma.contacts.deleteMany({ where: { contact_id: contactId } });
  }
  server.close();
});

describe('GraphQL API - Projects Sorting and Filtering', () => {
  const projectsQuery = `query Projects($chapters: [String!], $sort: [ProjectSortOption!]) { projects(chapters: $chapters, sort: $sort) { project_id name } }`;

  it('should sort projects by most recent', async () => {
    const response = await request(server)
      .post('/')
      .send({ query: projectsQuery, variables: { sort: ['MOST_RECENT'] } });
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const testProjects = response.body.data.projects.filter(
      (p: ProjectResponse) =>
        ['Old Project', 'Middle Project', 'Newest Project'].includes(p.name)
    );
    expect(testProjects[0].name).toBe('Newest Project');
    expect(testProjects[1].name).toBe('Middle Project');
    expect(testProjects[2].name).toBe('Old Project');
  });

  it('should filter projects by chapter name', async () => {
    const response = await request(server)
      .post('/')
      .send({
        query: projectsQuery,
        variables: { chapters: ['Projects Filter Chapter'] },
      });
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const testProjects = response.body.data.projects.filter(
      (p: ProjectResponse) =>
        ['Old Project', 'Middle Project', 'Newest Project'].includes(p.name)
    );
    expect(testProjects.length).toBe(3);
  });

  it('should return empty array when filtering by non-existent chapter name', async () => {
    const response = await request(server)
      .post('/')
      .send({
        query: projectsQuery,
        variables: { chapters: ['Non Existent Chapter Name'] },
      });
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const testProjects = response.body.data.projects.filter(
      (p: ProjectResponse) =>
        ['Old Project', 'Middle Project', 'Newest Project'].includes(p.name)
    );
    expect(testProjects.length).toBe(0);
  });

  it('should combine chapter filter and most recent sort', async () => {
    const response = await request(server)
      .post('/')
      .send({
        query: projectsQuery,
        variables: {
          chapters: ['Projects Filter Chapter'],
          sort: ['MOST_RECENT'],
        },
      });
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const testProjects = response.body.data.projects.filter(
      (p: ProjectResponse) =>
        ['Old Project', 'Middle Project', 'Newest Project'].includes(p.name)
    );
    expect(testProjects.length).toBe(3);
    expect(testProjects[0].name).toBe('Newest Project');
  });
});
