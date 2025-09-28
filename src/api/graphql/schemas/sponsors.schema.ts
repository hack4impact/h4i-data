export const sponsorSchemaString = `
  type Sponsor {
    sponsor_id: ID!
    name: String
    contact_id: String
    location_id: String!
    company_id: String!
    created_at: String!
    updated_at: String!
  }

  type Query {
    sponsors: [Sponsor!]!
    sponsor(id: ID!): Sponsor
  }

  input CreateSponsorInput {
    name: String
    contact_id: String
  }

  input UpdateSponsorInput {
    name: String
    contact_id: String
  }

  type Mutation {
    createSponsor(input: CreateSponsorInput!): Sponsor!
    updateSponsor(id: ID!, input: UpdateSponsorInput!): Sponsor!
    deleteSponsor(id: ID!): Sponsor
  }
`;
