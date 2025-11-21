import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { env } from '../../../src/config/server';
import { prisma } from '../../../src/config/database';

interface NonprofitResponse {
  nonprofit_id: string;
  name: string;
  status: string;
}

let server: Server;
let app: express.Application;
let contactId: string;
let chapterId: string;
let projectId: string;
let nonprofit1Id: string;
let nonprofit2Id: string;
let nonprofit3Id: string;

beforeAll(async () => {
  app = createGraphqlApp();
  server = app.listen(env.GRAPHQL_PORT);

  const contactMutation = `mutation CreateContact($input: CreateContactInput!) { createContact(input: $input) { contact_id } }`;
  const contactResponse = await request(server)
    .post('/')
    .send({
      query: contactMutation,
      variables: {
        input: {
          name: 'Sorting Test Contact',
          email: 'sorting@test.com',
          phone_number: '123-456-7890',
        },
      },
    });
  contactId = contactResponse.body.data.createContact.contact_id;

  const chapterMutation = `mutation CreateChapter($input: CreateChapterInput!) { createChapter(input: $input) { chapter_id } }`;
  const chapterResponse = await request(server)
    .post('/')
    .send({
      query: chapterMutation,
      variables: {
        input: {
          name: 'Test Chapter for Sorting',
          founded_date: '2020-01-01',
          status_type: 'ACTIVE',
        },
      },
    });
  chapterId = chapterResponse.body.data.createChapter.chapter_id;

  const projectMutation = `mutation CreateProject($input: CreateProjectInput!) { createProject(input: $input) { project_id } }`;
  const projectResponse = await request(server)
    .post('/')
    .send({
      query: projectMutation,
      variables: {
        input: {
          name: 'Test Project for Sorting',
          repo: 'https://github.com/test/sorting',
          project_type: 'DESIGN_AND_DEVELOP',
        },
      },
    });
  projectId = projectResponse.body.data.createProject.project_id;

  const createNonprofitMutation = `mutation CreateNonprofit($input: CreateNonprofitInput!) { createNonprofit(input: $input) { nonprofit_id } }`;
  const np1 = await request(server)
    .post('/')
    .send({
      query: createNonprofitMutation,
      variables: {
        input: {
          name: 'Zebra Nonprofit',
          mission: 'Test mission',
          contact_id: contactId,
        },
      },
    });
  nonprofit1Id = np1.body.data.createNonprofit.nonprofit_id;
  const np2 = await request(server)
    .post('/')
    .send({
      query: createNonprofitMutation,
      variables: {
        input: {
          name: 'Alpha Nonprofit',
          mission: 'Test mission',
          contact_id: contactId,
        },
      },
    });
  nonprofit2Id = np2.body.data.createNonprofit.nonprofit_id;
  const np3 = await request(server)
    .post('/')
    .send({
      query: createNonprofitMutation,
      variables: {
        input: {
          name: 'Beta Nonprofit',
          mission: 'Test mission',
          contact_id: contactId,
        },
      },
    });
  nonprofit3Id = np3.body.data.createNonprofit.nonprofit_id;

  await prisma.nonprofit_chapter_project.create({
    data: {
      nonprofit_id: nonprofit1Id,
      chapter_id: chapterId,
      project_id: projectId,
      project_contact_id: contactId,
      collab_contact_id: contactId,
      start_date: new Date('2024-06-01'),
      end_date: new Date('2025-12-31'),
      project_status: 'ACTIVE',
    },
  });
  await prisma.nonprofit_chapter_project.create({
    data: {
      nonprofit_id: nonprofit2Id,
      chapter_id: chapterId,
      project_id: projectId,
      project_contact_id: contactId,
      collab_contact_id: contactId,
      start_date: new Date('2023-01-01'),
      end_date: new Date('2023-12-31'),
      project_status: 'INACTIVE',
    },
  });
  await prisma.nonprofit_chapter_project.create({
    data: {
      nonprofit_id: nonprofit3Id,
      chapter_id: chapterId,
      project_id: projectId,
      project_contact_id: contactId,
      collab_contact_id: contactId,
      start_date: new Date('2024-01-01'),
      end_date: null,
      project_status: 'ACTIVE',
    },
  });
});

afterAll(async () => {
  await prisma.nonprofit_chapter_project.deleteMany({
    where: { nonprofit_id: { in: [nonprofit1Id, nonprofit2Id, nonprofit3Id] } },
  });
  await prisma.nonprofits.deleteMany({
    where: { nonprofit_id: { in: [nonprofit1Id, nonprofit2Id, nonprofit3Id] } },
  });
  await prisma.projects.deleteMany({ where: { project_id: projectId } });
  await prisma.chapters.deleteMany({ where: { chapter_id: chapterId } });
  await prisma.contacts.deleteMany({ where: { contact_id: contactId } });
  server.close();
});

describe('GraphQL API - Nonprofits Sorting and Filtering', () => {
  const nonprofitsQuery = `query Nonprofits($chapterIds: [ID!], $statuses: [StatusType!], $sort: [NonprofitSortOption!]) { nonprofits(chapterIds: $chapterIds, statuses: $statuses, sort: $sort) { nonprofit_id name status } }`;

  it('should sort nonprofits A to Z by name', async () => {
    const response = await request(server)
      .post('/')
      .send({ query: nonprofitsQuery, variables: { sort: ['A_TO_Z'] } });
    expect(response.status).toBe(200);
    const testNPs = response.body.data.nonprofits.filter(
      (np: NonprofitResponse) =>
        ['Alpha Nonprofit', 'Beta Nonprofit', 'Zebra Nonprofit'].includes(
          np.name
        )
    );
    expect(testNPs[0].name).toBe('Alpha Nonprofit');
    expect(testNPs[1].name).toBe('Beta Nonprofit');
    expect(testNPs[2].name).toBe('Zebra Nonprofit');
  });

  it('should sort nonprofits Z to A by name', async () => {
    const response = await request(server)
      .post('/')
      .send({ query: nonprofitsQuery, variables: { sort: ['Z_TO_A'] } });
    const testNPs = response.body.data.nonprofits.filter(
      (np: NonprofitResponse) =>
        ['Alpha Nonprofit', 'Beta Nonprofit', 'Zebra Nonprofit'].includes(
          np.name
        )
    );
    expect(testNPs[0].name).toBe('Zebra Nonprofit');
    expect(testNPs[2].name).toBe('Alpha Nonprofit');
  });

  it('should sort by most recent', async () => {
    const response = await request(server)
      .post('/')
      .send({ query: nonprofitsQuery, variables: { sort: ['MOST_RECENT'] } });
    const testNPs = response.body.data.nonprofits.filter(
      (np: NonprofitResponse) =>
        ['Alpha Nonprofit', 'Beta Nonprofit', 'Zebra Nonprofit'].includes(
          np.name
        )
    );
    expect(testNPs[0].name).toBe('Zebra Nonprofit');
  });

  it('should sort by status', async () => {
    const response = await request(server)
      .post('/')
      .send({ query: nonprofitsQuery, variables: { sort: ['STATUS'] } });
    const testNPs = response.body.data.nonprofits.filter(
      (np: NonprofitResponse) =>
        ['Alpha Nonprofit', 'Beta Nonprofit', 'Zebra Nonprofit'].includes(
          np.name
        )
    );
    expect(
      testNPs.filter((np: NonprofitResponse) => np.status === 'ACTIVE').length
    ).toBe(2);
  });

  it('should filter by ACTIVE status', async () => {
    const response = await request(server)
      .post('/')
      .send({ query: nonprofitsQuery, variables: { statuses: ['ACTIVE'] } });
    const testNPs = response.body.data.nonprofits.filter(
      (np: NonprofitResponse) =>
        ['Alpha Nonprofit', 'Beta Nonprofit', 'Zebra Nonprofit'].includes(
          np.name
        )
    );
    expect(testNPs.length).toBe(2);
    expect(
      testNPs.every((np: NonprofitResponse) => np.status === 'ACTIVE')
    ).toBe(true);
  });

  it('should filter by chapter', async () => {
    const response = await request(server)
      .post('/')
      .send({ query: nonprofitsQuery, variables: { chapterIds: [chapterId] } });
    expect(response.status).toBe(200);
    const testNPs = response.body.data.nonprofits.filter(
      (np: NonprofitResponse) =>
        ['Alpha Nonprofit', 'Beta Nonprofit', 'Zebra Nonprofit'].includes(
          np.name
        )
    );
    expect(testNPs.length).toBe(3);
  });

  it('should combine STATUS and MOST_RECENT sorting', async () => {
    const response = await request(server)
      .post('/')
      .send({
        query: nonprofitsQuery,
        variables: { sort: ['STATUS', 'MOST_RECENT'] },
      });
    const testNPs = response.body.data.nonprofits.filter(
      (np: NonprofitResponse) =>
        ['Alpha Nonprofit', 'Beta Nonprofit', 'Zebra Nonprofit'].includes(
          np.name
        )
    );
    expect(testNPs[0].status).toBe('ACTIVE');
    expect(testNPs[0].name).toBe('Zebra Nonprofit');
  });
});
