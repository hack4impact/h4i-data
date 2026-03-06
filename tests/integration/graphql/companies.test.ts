import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

// Helper to create a company for tests
const createTestCompany = async (name = 'Test Co') => {
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

describe('GraphQL Companies CRUD', () => {
  it('creates a company', async () => {
    // Act
    const company = await createTestCompany('New Test Co');

    // Assert
    expect(company.name).toBe('New Test Co');
    expect(company.company_id).toBeDefined();
  });

  it('reads a company by id', async () => {
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
    expect(res.body.data.company.company_id).toBe(company.company_id);
  });

  it('updates a company', async () => {
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
    expect(res.body.data.updateCompany.name).toBe('Test Co Updated');
  });

  it('lists companies', async () => {
    // Arrange
    await createTestCompany('Company A');
    await createTestCompany('Company B');

    // Act
    const query = { query: `query { companies { company_id name } }` };
    const res = await request(app).post('/').send(query);

    // Assert
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.companies)).toBe(true);
    expect(res.body.data.companies.length).toBeGreaterThanOrEqual(2);
  });

  it('deletes a company', async () => {
    // Arrange
    const company = await createTestCompany();
    const mutation = {
      query: `
        mutation Delete($id: ID!) { deleteCompany(id: $id) { company_id } }
      `,
      variables: { id: company.company_id },
    };

    // Act
    const res = await request(app).post('/').send(mutation);
    expect(res.status).toBe(200);
    expect(res.body.data.deleteCompany.company_id).toBe(company.company_id);

    // Assert: Verify it's gone
    const verifyRes = await request(app)
      .post('/')
      .send({
        query: `query($id: ID!) { company(id: $id) { company_id } }`,
        variables: { id: company.company_id },
      });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.company).toBeNull();
  });
});
