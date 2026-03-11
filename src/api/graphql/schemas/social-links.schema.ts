export const socialLinkSchemaString = `
  enum LinkType {
    SOCIAL_MEDIA
    GITHUB
    FIGMA
    LINKEDIN
    WEBSITE
    OTHER
  }

  type SocialLink {
    constituent_link_id: ID!
    constituent_id: ID!
    platform: LinkType
    url: String!
    created_at: String
    updated_at: String
  }

  type Query {
    socialLinks: [SocialLink!]!
    socialLink(id: ID!): SocialLink
  }

  input CreateSocialLinkInput {
    constituent_id: ID!
    platform: LinkType
    url: String!
  }

  input UpdateSocialLinkInput {
    constituent_id: ID
    platform: LinkType
    url: String
  }

  type Mutation {
    createSocialLink(input: CreateSocialLinkInput!): SocialLink!
    updateSocialLink(id: ID!, input: UpdateSocialLinkInput!): SocialLink!
    deleteSocialLink(id: ID!): SocialLink
  }
`;
