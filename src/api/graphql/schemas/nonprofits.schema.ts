export const nonprofitSchemaString = `
  type Nonprofit {
    nonprofit_id: ID!
    name: String!
    mission: String!
    website: String
    location_id: String
    contact_id: String!
    created_at: String!
    updated_at: String!
  }

  type Query {
    nonprofits: [Nonprofit!]!
    nonprofit(id: ID!): Nonprofit
  }

  input CreateNonprofitInput {
    name: String!
    mission: String!
    contact_id: String!
    website: String
    location_id: String
  }

  input UpdateNonprofitInput {
    name: String
    mission: String
    contact_id: String
    website: String
    location_id: String
  }

  type Mutation {
    createNonprofit(input: CreateNonprofitInput!): Nonprofit!
    updateNonprofit(nonprofit_id: ID!, input: UpdateNonprofitInput!): Nonprofit!
    deleteNonprofit(id: ID!): Nonprofit
  }
`;
