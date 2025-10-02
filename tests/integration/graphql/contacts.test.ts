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
  });

  it('should create and fetch a contact by its ID via query', async () => {
    // Create a contact for this specific test
    const createMutation = `
      mutation CreateContact($input: CreateContactInput!) {
        createContact(input: $input) {
          contact_id
          name
          email
        }
      }
    `;
    const createVariables = {
      input: {
        name: 'Test Contact for Query',
        email: 'query@example.com',
        phone_number: '987-654-3210',
      },
    };

    const createResponse = await request(server)
      .post('/')
      .send({ query: createMutation, variables: createVariables });

    expect(createResponse.status).toBe(200);
    expect(createResponse.body.errors).toBeUndefined();
    const contactId = createResponse.body.data.createContact.contact_id;

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
    expect(contact.name).toBe('Test Contact for Query');
  });
});
