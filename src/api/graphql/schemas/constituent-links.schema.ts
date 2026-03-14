export const constituentLinkSchemaString = `
  enum LinkType {
    SOCIAL_MEDIA
    GITHUB
    FIGMA
    LINKEDIN
    WEBSITE
    OTHER
  }

  type ConstituentLink {
    constituent_link_id: ID!
    constituent_id: ID!
    platform: LinkType
    url: String!
    created_at: String
    updated_at: String
  }

  type Query {
    constituentLinks: [ConstituentLink!]!
    constituentLink(id: ID!): ConstituentLink
  }

  input CreateConstituentLinkInput {
    constituent_id: ID!
    platform: LinkType
    url: String!
  }

  input UpdateConstituentLinkInput {
    constituent_id: ID
    platform: LinkType
    url: String
  }

  type Mutation {
    createConstituentLink(input: CreateConstituentLinkInput!): ConstituentLink!
    updateConstituentLink(id: ID!, input: UpdateConstituentLinkInput!): ConstituentLink!
    deleteConstituentLink(id: ID!): ConstituentLink
  }
`;
