import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

// Helper function to create a partner for tests
const createTestPartner = async () => {
  const mutation = `
    mutation CreatePartner($input: CreatePartnerInput!) {
      createPartner(input: $input) {
        partner_id
        legal_name
      }
    }
  `;
  const variables = {
    input: {
      legal_name: `Test Partner ${Date.now()}.${Math.random()}`,
      mission_statement: 'Helping communities through technology',
    },
  };
  const response = await request(app)
    .post('/')
    .send({ query: mutation, variables });
  return response.body.data.createPartner;
};

describe('GraphQL API - Partners', () => {
  it('should create a new partner via mutation', async () => {
    // Act
    const mutation = `
      mutation CreatePartner($input: CreatePartnerInput!) {
        createPartner(input: $input) {
          partner_id
          legal_name
          mission_statement
          pcs_organization_type
        }
      }
    `;
    const variables = {
      input: {
        legal_name: 'Community Tech Org',
        mission_statement: 'Empowering through technology',
        pcs_organization_type: 'Nonprofit',
      },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const partner = response.body.data.createPartner;
    expect(partner.partner_id).toBeDefined();
    expect(partner.legal_name).toBe('Community Tech Org');
  });

  it('should fetch a partner by ID via query', async () => {
    // Arrange
    const created = await createTestPartner();

    // Act
    const query = `
      query Partner($id: ID!) {
        partner(id: $id) {
          partner_id
          legal_name
        }
      }
    `;
    const variables = { id: created.partner_id };
    const response = await request(app).post('/').send({ query, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.partner.partner_id).toBe(created.partner_id);
  });

  it('should fetch all partners', async () => {
    // Arrange
    await createTestPartner();

    // Act
    const query = `query { partners { partner_id } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const partners = response.body.data.partners;
    expect(Array.isArray(partners)).toBe(true);
    expect(partners.length).toBeGreaterThan(0);
  });

  it('should return null for non-existent partner', async () => {
    // Act
    const query = `
      query {
        partner(id: "00000000-0000-0000-0000-000000000000") {
          partner_id
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.partner).toBeNull();
  });

  it('should update a partner', async () => {
    // Arrange
    const created = await createTestPartner();

    // Act
    const mutation = `
      mutation UpdatePartner($id: ID!, $input: UpdatePartnerInput!) {
        updatePartner(id: $id, input: $input) {
          partner_id
          legal_name
        }
      }
    `;
    const variables = {
      id: created.partner_id,
      input: { legal_name: 'Updated Partner' },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updatePartner.legal_name).toBe('Updated Partner');
  });

  it('should return errors when updating a non-existent partner', async () => {
    // Act
    const mutation = `
      mutation UpdatePartner($id: ID!, $input: UpdatePartnerInput!) {
        updatePartner(id: $id, input: $input) {
          partner_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: {
          id: '00000000-0000-0000-0000-000000000000',
          input: { legal_name: 'Updated Partner' },
        },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return a validation error for an invalid partner input', async () => {
    // Arrange
    const created = await createTestPartner();

    // Act
    const mutation = `
      mutation UpdatePartner($id: ID!, $input: UpdatePartnerInput!) {
        updatePartner(id: $id, input: $input) {
          partner_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: { id: created.partner_id, input: { legal_name: '' } },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return errors when deleting a non-existent partner', async () => {
    // Act
    const mutation = `
      mutation DeletePartner($id: ID!) {
        deletePartner(id: $id) {
          partner_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: { id: '00000000-0000-0000-0000-000000000000' },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should delete a partner', async () => {
    // Arrange
    const created = await createTestPartner();

    // Act
    const mutation = `
      mutation DeletePartner($id: ID!) {
        deletePartner(id: $id) {
          partner_id
        }
      }
    `;
    const variables = { id: created.partner_id };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deletePartner.partner_id).toBe(
      created.partner_id
    );
  });
});
