import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { env } from '../../../src/config/server';

let server: Server;
let app: express.Application;
let contactId: string;

beforeAll(() => {
  app = createGraphqlApp();
  server = app.listen(env.GRAPHQL_PORT);
});

afterAll(() => {
  server.close();
});

describe('GraphQL API - Contacts', () => {
  it('should create a new contact via mutation', async () => {
    const mutation = `
      mutation CreateContact($input: CreateContactInput!) {
        createContact(input: $input) {
          contact_id
          name
          email
          phone_number
        }
      }
    `;
    const variables = {
      input: {
        name: 'GraphQL Integration Test Contact',
        email: 'test@example.com',
        phone_number: '123-456-7890',
      },
    };

    const response = await request(server)
      .post('/') // GraphQL server is at the root
      .send({ query: mutation, variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const contact = response.body.data.createContact;
    expect(contact).toHaveProperty('contact_id');
    expect(contact.name).toBe('GraphQL Integration Test Contact');

    contactId = contact.contact_id;
  });

  it('should fetch a contact by its ID via query', async () => {
    // Now fetch it
    const query = `
      query Contact($id: ID!) {
        contact(id: $id) {
          contact_id
          name
          email
        }
      }
    `;
    const variables = { id: contactId };

    const response = await request(server).post('/').send({ query, variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const contact = response.body.data.contact;
    expect(contact.contact_id).toBe(contactId);
    expect(contact.name).toBe('GraphQL Integration Test Contact');
  });

  it('should delete a contact by its ID via mutation', async () => {
    const mutation = `
      mutation DeleteContact($id: ID!) {
        deleteContact(id: $id) {
          contact_id
        }
      }
    `;
    const variables = { id: contactId };

    const response = await request(server)
      .post('/')
      .send({ query: mutation, variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteContact).toHaveProperty(
      'contact_id',
      contactId
    );
  });
});
