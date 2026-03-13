import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { createRestApp } from '../../../src/api/rest/server';

const app = createGraphqlApp();
const restApp = createRestApp();

const createTestConstituent = async () => {
  const res = await request(restApp)
    .post('/constituents')
    .send({
      first_name: 'Test',
      last_name: 'User',
      primary_email: `gql.social.${Date.now()}.${Math.random()}@example.com`,
    });
  return res.body.constituent_id;
};

const createTestConstituentLink = async (
  constituentId: string,
  url: string
) => {
  const mutation = `
    mutation CreateConstituentLink($input: CreateConstituentLinkInput!) {
      createConstituentLink(input: $input) {
        constituent_link_id
        constituent_id
        url
      }
    }
  `;
  const response = await request(app)
    .post('/')
    .send({
      query: mutation,
      variables: { input: { constituent_id: constituentId, url } },
    });
  return response.body.data.createConstituentLink;
};

describe('GraphQL API - Constituent Links', () => {
  it('should create a new constituent link via mutation', async () => {
    // Arrange
    const constituentId = await createTestConstituent();

    // Act
    const mutation = `
      mutation CreateConstituentLink($input: CreateConstituentLinkInput!) {
        createConstituentLink(input: $input) {
          constituent_link_id
          constituent_id
          platform
          url
        }
      }
    `;
    const variables = {
      input: {
        constituent_id: constituentId,
        platform: 'GITHUB',
        url: 'https://github.com/testuser',
      },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const link = response.body.data.createConstituentLink;
    expect(link).toHaveProperty('constituent_link_id');
    expect(link.constituent_id).toBe(constituentId);
    expect(link.platform).toBe('GITHUB');
  });

  it('should fetch a constituent link by ID via query', async () => {
    // Arrange
    const constituentId = await createTestConstituent();
    const created = await createTestConstituentLink(
      constituentId,
      'https://github.com/test2'
    );

    // Act
    const query = `
      query ConstituentLink($id: ID!) {
        constituentLink(id: $id) {
          constituent_link_id
          url
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query, variables: { id: created.constituent_link_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.constituentLink.constituent_link_id).toBe(
      created.constituent_link_id
    );
  });

  it('should return null for a non-existent constituent link ID', async () => {
    // Act
    const query = `
      query {
        constituentLink(id: "00000000-0000-0000-0000-000000000000") {
          constituent_link_id
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.constituentLink).toBeNull();
  });

  it('should fetch all constituent links via query', async () => {
    // Arrange
    const constituentId = await createTestConstituent();
    await createTestConstituentLink(
      constituentId,
      'https://linkedin.com/in/test'
    );

    // Act
    const query = `query { constituentLinks { constituent_link_id url } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.constituentLinks)).toBe(true);
    expect(response.body.data.constituentLinks.length).toBeGreaterThan(0);
  });

  it('should update a constituent link via mutation', async () => {
    // Arrange
    const constituentId = await createTestConstituent();
    const created = await createTestConstituentLink(
      constituentId,
      'https://github.com/original'
    );

    // Act
    const mutation = `
      mutation UpdateConstituentLink($id: ID!, $input: UpdateConstituentLinkInput!) {
        updateConstituentLink(id: $id, input: $input) {
          constituent_link_id
          url
        }
      }
    `;
    const variables = {
      id: created.constituent_link_id,
      input: { url: 'https://github.com/updated' },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateConstituentLink.url).toBe(
      'https://github.com/updated'
    );
  });

  it('should return errors when updating a non-existent constituent link', async () => {
    // Act
    const mutation = `
      mutation UpdateConstituentLink($id: ID!, $input: UpdateConstituentLinkInput!) {
        updateConstituentLink(id: $id, input: $input) {
          constituent_link_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: {
          id: '00000000-0000-0000-0000-000000000000',
          input: { url: 'https://github.com/updated' },
        },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return a validation error for an invalid constituent link input', async () => {
    // Arrange
    const constituentId = await createTestConstituent();
    const created = await createTestConstituentLink(
      constituentId,
      'https://github.com/original'
    );

    // Act
    const mutation = `
      mutation UpdateConstituentLink($id: ID!, $input: UpdateConstituentLinkInput!) {
        updateConstituentLink(id: $id, input: $input) {
          constituent_link_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: {
          id: created.constituent_link_id,
          input: { url: 'not-a-url' },
        },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return errors when deleting a non-existent constituent link', async () => {
    // Act
    const mutation = `
      mutation DeleteConstituentLink($id: ID!) {
        deleteConstituentLink(id: $id) {
          constituent_link_id
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

  it('should delete a constituent link via mutation', async () => {
    // Arrange
    const constituentId = await createTestConstituent();
    const created = await createTestConstituentLink(
      constituentId,
      'https://github.com/todelete'
    );

    // Act
    const mutation = `
      mutation DeleteConstituentLink($id: ID!) {
        deleteConstituentLink(id: $id) {
          constituent_link_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: { id: created.constituent_link_id },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteConstituentLink.constituent_link_id).toBe(
      created.constituent_link_id
    );

    // Verify it's gone
    const verifyQuery = `query { constituentLink(id: "${created.constituent_link_id}") { constituent_link_id } }`;
    const verifyResponse = await request(app)
      .post('/')
      .send({ query: verifyQuery });
    expect(verifyResponse.body.data.constituentLink).toBeNull();
  });
});
