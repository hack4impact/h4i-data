import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { env } from '../../../src/config/server';

let server: Server;
let app: express.Application;
let contactId: string;
let nonprofitId: string;

beforeAll(async () => {
  app = createGraphqlApp();
  server = app.listen(env.GRAPHQL_PORT);

  // create a contact and get its id
  const contactMutation = `
  mutation CreateContact($input: CreateContactInput!) {
    createContact(input: $input) {
      contact_id
      name
      email
      phone_number
      }
    }
  `;

  const contactVariables = {
    input: {
      name: 'GraphQL Integration Test Contact',
      email: 'test@example.com',
      phone_number: '123-456-7890',
    },
  };

  const contactResponse = await request(server)
    .post('/') // GraphQL server is at the root
    .send({ query: contactMutation, variables: contactVariables });

  contactId = contactResponse.body.data.createContact.contact_id;
});

afterAll(() => {
  server.close();
});

describe('GraphQL API - Nonprofits', () => {
  it('should create a new nonprofit via mutation', async () => {
    const mutation = `
      mutation CreateNonprofit($input: CreateNonprofitInput!) {
        createNonprofit(input: $input) {
          nonprofit_id
          name
          mission
          website
          location_id
          contact_id
        }
      }
    `;
    const variables = {
      input: {
        name: 'GraphQL Integration Test Nonprofit',
        mission: 'This is a test mission for nonprofit',
        website: 'https://example.org', // must be a valid URL
        contact_id: contactId,
      },
    };

    const response = await request(server)
      .post('/')
      .send({ query: mutation, variables });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const nonprofit = response.body.data.createNonprofit;
    expect(nonprofit).toHaveProperty('nonprofit_id');
    expect(nonprofit.name).toBe('GraphQL Integration Test Nonprofit');

    nonprofitId = nonprofit.nonprofit_id;
  });

  it('should fetch a nonprofit by its ID via query', async () => {
    const query = `
      query Nonprofit($id: ID!) {
        nonprofit(id: $id) {
          nonprofit_id
          name
          mission
          website
          location_id
          contact_id
        }
      }
    `;
    const variables = { id: nonprofitId };

    const response = await request(server).post('/').send({ query, variables });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const nonprofit = response.body.data.nonprofit;
    expect(nonprofit.nonprofit_id).toBe(nonprofitId);
    expect(nonprofit.name).toBe('GraphQL Integration Test Nonprofit');
  });
});
