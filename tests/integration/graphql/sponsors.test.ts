import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { env } from '../../../src/config/server';

let server: Server;
let app: express.Application;
let contactId: string;
let sponsorId: string;

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

describe('GraphQL API - Sponsors', () => {
  it('should create a new sponsor via mutation', async () => {
    const mutation = `
      mutation CreateSponsor($input: CreateSponsorInput!) {
        createSponsor(input: $input) {
          sponsor_id
          name
          contact_id
        }
      }
    `;
    const variables = {
      input: {
        name: 'GraphQL Integration Test Sponsor',
        contact_id: contactId, // Example UUID
      },
    };

    const response = await request(server)
      .post('/')
      .send({ query: mutation, variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const sponsor = response.body.data.createSponsor;
    expect(sponsor).toHaveProperty('sponsor_id');
    expect(sponsor.name).toBe('GraphQL Integration Test Sponsor');

    sponsorId = sponsor.sponsor_id;
  });

  it('should fetch a sponsor by its ID via query', async () => {
    // Now fetch it
    const query = `
      query Sponsor($id: ID!) {
        sponsor(id: $id) {
          sponsor_id
          name
        }
      }
    `;
    const variables = { id: sponsorId };

    const response = await request(server).post('/').send({ query, variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const sponsor = response.body.data.sponsor;
    expect(sponsor.sponsor_id).toBe(sponsorId);
    expect(sponsor.name).toBe('GraphQL Integration Test Sponsor');
  });

  it('should delete a sponsor via mutation', async () => {
    const mutation = `
      mutation DeleteSponsor($id: ID!) {
        deleteSponsor(id: $id) {
          sponsor_id
        }
      }
    `;
    const variables = { id: sponsorId };

    const response = await request(server)
      .post('/')
      .send({ query: mutation, variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const deletedSponsor = response.body.data.deleteSponsor;
    expect(deletedSponsor.sponsor_id).toBe(sponsorId);
  });
});
