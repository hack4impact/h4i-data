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

const createTestSocialLink = async (constituentId: string, url: string) => {
  const mutation = `
    mutation CreateSocialLink($input: CreateSocialLinkInput!) {
      createSocialLink(input: $input) {
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
  return response.body.data.createSocialLink;
};

describe('GraphQL API - Social Links', () => {
  it('should create a new social link via mutation', async () => {
    // Arrange
    const constituentId = await createTestConstituent();

    // Act
    const mutation = `
      mutation CreateSocialLink($input: CreateSocialLinkInput!) {
        createSocialLink(input: $input) {
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
    const link = response.body.data.createSocialLink;
    expect(link).toHaveProperty('constituent_link_id');
    expect(link.constituent_id).toBe(constituentId);
    expect(link.platform).toBe('GITHUB');
  });

  it('should fetch a social link by ID via query', async () => {
    // Arrange
    const constituentId = await createTestConstituent();
    const created = await createTestSocialLink(
      constituentId,
      'https://github.com/test2'
    );

    // Act
    const query = `
      query SocialLink($id: ID!) {
        socialLink(id: $id) {
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
    expect(response.body.data.socialLink.constituent_link_id).toBe(
      created.constituent_link_id
    );
  });

  it('should return null for a non-existent social link ID', async () => {
    // Act
    const query = `
      query {
        socialLink(id: "00000000-0000-0000-0000-000000000000") {
          constituent_link_id
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.socialLink).toBeNull();
  });

  it('should fetch all social links via query', async () => {
    // Arrange
    const constituentId = await createTestConstituent();
    await createTestSocialLink(constituentId, 'https://linkedin.com/in/test');

    // Act
    const query = `query { socialLinks { constituent_link_id url } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.socialLinks)).toBe(true);
    expect(response.body.data.socialLinks.length).toBeGreaterThan(0);
  });

  it('should update a social link via mutation', async () => {
    // Arrange
    const constituentId = await createTestConstituent();
    const created = await createTestSocialLink(
      constituentId,
      'https://github.com/original'
    );

    // Act
    const mutation = `
      mutation UpdateSocialLink($id: ID!, $input: UpdateSocialLinkInput!) {
        updateSocialLink(id: $id, input: $input) {
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
    expect(response.body.data.updateSocialLink.url).toBe(
      'https://github.com/updated'
    );
  });

  it('should return errors when updating a non-existent social link', async () => {
    // Act
    const mutation = `
      mutation UpdateSocialLink($id: ID!, $input: UpdateSocialLinkInput!) {
        updateSocialLink(id: $id, input: $input) {
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

  it('should return a validation error for an invalid social link input', async () => {
    // Arrange
    const constituentId = await createTestConstituent();
    const created = await createTestSocialLink(
      constituentId,
      'https://github.com/original'
    );

    // Act
    const mutation = `
      mutation UpdateSocialLink($id: ID!, $input: UpdateSocialLinkInput!) {
        updateSocialLink(id: $id, input: $input) {
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

  it('should return errors when deleting a non-existent social link', async () => {
    // Act
    const mutation = `
      mutation DeleteSocialLink($id: ID!) {
        deleteSocialLink(id: $id) {
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

  it('should delete a social link via mutation', async () => {
    // Arrange
    const constituentId = await createTestConstituent();
    const created = await createTestSocialLink(
      constituentId,
      'https://github.com/todelete'
    );

    // Act
    const mutation = `
      mutation DeleteSocialLink($id: ID!) {
        deleteSocialLink(id: $id) {
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
    expect(response.body.data.deleteSocialLink.constituent_link_id).toBe(
      created.constituent_link_id
    );

    // Verify it's gone
    const verifyQuery = `query { socialLink(id: "${created.constituent_link_id}") { constituent_link_id } }`;
    const verifyResponse = await request(app)
      .post('/')
      .send({ query: verifyQuery });
    expect(verifyResponse.body.data.socialLink).toBeNull();
  });
});
