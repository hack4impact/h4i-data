export const nonprofitSchemaString = `
  enum NonprofitSortOption {
    A_TO_Z
    Z_TO_A
    MOST_RECENT
    STATUS
  }

  type Nonprofit {
    nonprofit_id: ID!
    name: String!
    mission: String!
    website: String
    location_id: String
    contact_id: String!
    created_at: String!
    updated_at: String!
    status: StatusType!
  }

  type Query {
    nonprofits(
      chapterIds: [ID!]
      chapterNames: [String!]
      statuses: [StatusType!]
      sort: [NonprofitSortOption!]
    ): [Nonprofit!]!
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
