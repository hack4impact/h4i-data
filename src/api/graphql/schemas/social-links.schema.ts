export const socialLinkSchemaString = `
  enum SocialPlatformType {
    GITHUB
    LINKEDIN
    PORTFOLIO
    TWITTER
    DRIBBBLE
    OTHER
  }

  type SocialLink {
    link_id: ID!
    constituent_id: ID
    platform: SocialPlatformType
    url: String
    is_featured: Boolean
  }

  type Query {
    socialLinks: [SocialLink!]!
    socialLink(id: ID!): SocialLink
  }

  input CreateSocialLinkInput {
    constituent_id: ID
    platform: SocialPlatformType
    url: String
    is_featured: Boolean
  }

  input UpdateSocialLinkInput {
    constituent_id: ID
    platform: SocialPlatformType
    url: String
    is_featured: Boolean
  }

  type Mutation {
    createSocialLink(input: CreateSocialLinkInput!): SocialLink!
    updateSocialLink(id: ID!, input: UpdateSocialLinkInput!): SocialLink!
    deleteSocialLink(id: ID!): SocialLink
  }
`;
