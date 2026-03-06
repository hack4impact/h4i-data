import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

// Helper to create a company for tests
const createTestCompany = async (
  name = `Test Co ${Date.now()}.${Math.random()}`
) => {
  const mutation = {
    query: `
      mutation Create($input: CreateCompanyInput!) {
        createCompany(input: $input) { company_id name }
      }
    `,
    variables: { input: { name } },
  };
  const res = await request(app).post('/').send(mutation);
  return res.body.data.createCompany;
};

describe('GraphQL API - Companies', () => {
  it('should create a new company via mutation', async () => {
    // Act
    const mutation = `
      mutation CreateCompany($input: CreateCompanyInput!) {
        createCompany(input: $input) {
          company_id
          name
        }
      }
    `;
    const name = `Test Co ${Date.now()}.${Math.random()}`;
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables: { input: { name } } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const company = response.body.data.createCompany;
    expect(company).toHaveProperty('company_id');
    expect(company.name).toBe(name);
  });

  it('should fetch a company by ID via query', async () => {
    // Arrange
    const company = await createTestCompany();
    const query = {
      query: `
        query One($id: ID!) { company(id: $id) { company_id name } }
      `,
      variables: { id: company.company_id },
    };

    // Act
    const res = await request(app).post('/').send(query);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.company.company_id).toBe(company.company_id);
  });

  it('should return null for a non-existent company ID', async () => {
    // Act
    const res = await request(app).post('/').send({
      query: `query { company(id: "00000000-0000-0000-0000-000000000000") { company_id } }`,
    });

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.data.company).toBeNull();
  });

  it('should fetch all companies via query', async () => {
    // Arrange
    await createTestCompany();

    // Act
    const query = { query: `query { companies { company_id name } }` };
    const res = await request(app).post('/').send(query);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(Array.isArray(res.body.data.companies)).toBe(true);
    expect(res.body.data.companies.length).toBeGreaterThan(0);
  });

  it('should update a company via mutation', async () => {
    // Arrange
    const company = await createTestCompany();
    const mutation = {
      query: `
        mutation Update($id: ID!, $input: UpdateCompanyInput!) {
          updateCompany(id: $id, input: $input) { company_id name }
        }
      `,
      variables: {
        id: company.company_id,
        input: { name: 'Test Co Updated' },
      },
    };

    // Act
    const res = await request(app).post('/').send(mutation);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.updateCompany.name).toBe('Test Co Updated');
  });

  it('should return errors when updating a non-existent company', async () => {
    // Act
    const res = await request(app)
      .post('/')
      .send({
        query: `
        mutation Update($id: ID!, $input: UpdateCompanyInput!) {
          updateCompany(id: $id, input: $input) { company_id }
        }
      `,
        variables: {
          id: '00000000-0000-0000-0000-000000000000',
          input: { name: 'Updated' },
        },
      });

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.errors).toBeDefined();
  });

  it('should return a validation error for an invalid company input', async () => {
    // Arrange
    const company = await createTestCompany();

    // Act
    const res = await request(app)
      .post('/')
      .send({
        query: `
        mutation Update($id: ID!, $input: UpdateCompanyInput!) {
          updateCompany(id: $id, input: $input) { company_id }
        }
      `,
        variables: { id: company.company_id, input: { name: '' } },
      });

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.errors).toBeDefined();
  });

  it('should return errors when deleting a non-existent company', async () => {
    // Act
    const res = await request(app)
      .post('/')
      .send({
        query: `mutation Delete($id: ID!) { deleteCompany(id: $id) { company_id } }`,
        variables: { id: '00000000-0000-0000-0000-000000000000' },
      });

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.errors).toBeDefined();
  });

  it('should delete a company via mutation', async () => {
    // Arrange
    const company = await createTestCompany();

    // Act
    const res = await request(app)
      .post('/')
      .send({
        query: `
        mutation Delete($id: ID!) { deleteCompany(id: $id) { company_id } }
      `,
        variables: { id: company.company_id },
      });

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.deleteCompany.company_id).toBe(company.company_id);

    // Verify deletion
    const verifyRes = await request(app)
      .post('/')
      .send({
        query: `query($id: ID!) { company(id: $id) { company_id } }`,
        variables: { id: company.company_id },
      });
    expect(verifyRes.body.data.company).toBeNull();
  });
});
