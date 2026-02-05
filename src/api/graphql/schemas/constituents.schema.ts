export const constituentSchemaString = `
  type Constituent {
    constituent_id: ID!
    first_name: String
    last_name: String
    primary_email: String!
    phone_number: String
    created_at: String
    updated_at: String
  }

  type Query {
    constituents: [Constituent!]!
    constituent(id: ID!): Constituent
  }

  input CreateConstituentInput {
    first_name: String
    last_name: String
    primary_email: String!
    phone_number: String
  }

  input UpdateConstituentInput {
    first_name: String
    last_name: String
    primary_email: String
    phone_number: String
  }

  type Mutation {
    createConstituent(input: CreateConstituentInput!): Constituent!
    updateConstituent(id: ID!, input: UpdateConstituentInput!): Constituent!
    deleteConstituent(id: ID!): Constituent
  }
`;
