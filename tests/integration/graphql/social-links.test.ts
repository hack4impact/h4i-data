import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { createRestApp } from '../../../src/api/rest/server';

const gqlApp = createGraphqlApp();
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

describe('GraphQL API - Social Links', () => {
  it('should create a social link', async () => {
    const constituentId = await createTestConstituent();

    const res = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateSocialLinkInput!) { createSocialLink(input: $input) { link_id constituent_id url } }`,
        variables: {
          input: {
            constituent_id: constituentId,
            url: 'https://github.com/test',
          },
        },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.createSocialLink).toHaveProperty('link_id');
    expect(res.body.data.createSocialLink.constituent_id).toBe(constituentId);
  });

  it('should fetch a social link by ID', async () => {
    const constituentId = await createTestConstituent();
    const created = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateSocialLinkInput!) { createSocialLink(input: $input) { link_id } }`,
        variables: {
          input: {
            constituent_id: constituentId,
            url: 'https://github.com/test2',
          },
        },
      });
    const id = created.body.data.createSocialLink.link_id;

    const res = await request(gqlApp).post('/').send({
      query: `query ($id: ID!) { socialLink(id: $id) { link_id url } }`,
      variables: { id },
    });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.socialLink.link_id).toBe(id);
  });

  it('should fetch all social links', async () => {
    const constituentId = await createTestConstituent();
    await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateSocialLinkInput!) { createSocialLink(input: $input) { link_id } }`,
        variables: {
          input: {
            constituent_id: constituentId,
            url: 'https://linkedin.com/in/test',
          },
        },
      });

    const res = await request(gqlApp).post('/').send({
      query: `query { socialLinks { link_id url } }`,
    });

    expect(res.body.errors).toBeUndefined();
    expect(Array.isArray(res.body.data.socialLinks)).toBe(true);
    expect(res.body.data.socialLinks.length).toBeGreaterThan(0);
  });

  it('should update a social link', async () => {
    const constituentId = await createTestConstituent();
    const created = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateSocialLinkInput!) { createSocialLink(input: $input) { link_id } }`,
        variables: {
          input: {
            constituent_id: constituentId,
            url: 'https://github.com/original',
          },
        },
      });
    const id = created.body.data.createSocialLink.link_id;

    const res = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($id: ID!, $input: UpdateSocialLinkInput!) { updateSocialLink(id: $id, input: $input) { url is_featured } }`,
        variables: {
          id,
          input: { url: 'https://github.com/updated', is_featured: true },
        },
      });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.updateSocialLink.url).toBe(
      'https://github.com/updated'
    );
  });

  it('should delete a social link', async () => {
    const constituentId = await createTestConstituent();
    const created = await request(gqlApp)
      .post('/')
      .send({
        query: `mutation ($input: CreateSocialLinkInput!) { createSocialLink(input: $input) { link_id } }`,
        variables: {
          input: {
            constituent_id: constituentId,
            url: 'https://github.com/todelete',
          },
        },
      });
    const id = created.body.data.createSocialLink.link_id;

    const res = await request(gqlApp).post('/').send({
      query: `mutation ($id: ID!) { deleteSocialLink(id: $id) { link_id } }`,
      variables: { id },
    });

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.deleteSocialLink.link_id).toBe(id);
  });
});
