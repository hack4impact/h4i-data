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

describe('GraphQL Companies CRUD', () => {
  let createdId: string;

  it('creates a company', async () => {
    const mutation = {
      query: `
        mutation Create($input: CompanyCreateInput!) {
          createCompany(input: $input) { company_id name location_id }
        }
      `,
      variables: { input: { name: 'Test Co', location_id: null } },
    };

    const res = await request(server).post('/').send(mutation);
    expect(res.status).toBe(200);
    const company = res.body.data.createCompany;
    expect(company.name).toBe('Test Co');
    expect(company.company_id).toBeDefined();
    createdId = company.company_id;
  });

  it('reads a company by id', async () => {
    const query = {
      query: `
        query One($id: ID!) { company(company_id: $id) { company_id name location_id } }
      `,
      variables: { id: createdId },
    };

    const res = await request(server).post('/').send(query);
    expect(res.status).toBe(200);
    expect(res.body.data.company.company_id).toBe(createdId);
  });

  it('updates a company', async () => {
    const mutation = {
      query: `
        mutation Update($id: ID!, $input: CompanyUpdateInput!) {
          updateCompany(company_id: $id, input: $input) { company_id name }
        }
      `,
      variables: { id: createdId, input: { name: 'Test Co Updated' } },
    };

    const res = await request(server).post('/').send(mutation);
    expect(res.status).toBe(200);
    expect(res.body.data.updateCompany.name).toBe('Test Co Updated');
  });

  it('lists companies', async () => {
    const query = { query: `query { companies { company_id name } }` };
    const res = await request(server).post('/').send(query);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.companies)).toBe(true);
  });

  it('deletes a company', async () => {
    const mutation = {
      query: `
        mutation Delete($id: ID!) { deleteCompany(company_id: $id) }
      `,
      variables: { id: createdId },
    };
    const res = await request(server).post('/').send(mutation);
    expect(res.status).toBe(200);
    expect(res.body.data.deleteCompany).toBe(true);

    const verify = await request(server)
      .post('/')
      .send({
        query: `query($id: ID!) { company(company_id: $id) { company_id } }`,
        variables: { id: createdId },
      });
    expect(verify.status).toBe(200);
    expect(verify.body.data.company).toBeNull();
  });
});
