export const majorSchemaString = `
  type Major {
    major_id: ID!
    name: String!
    created_at: String
    updated_at: String
  }

  type Query {
    majors: [Major!]!
    major(id: ID!): Major
  }

  input CreateMajorInput {
    name: String!
  }

  input UpdateMajorInput {
    name: String
  }

  type Mutation {
    createMajor(input: CreateMajorInput!): Major!
    updateMajor(id: ID!, input: UpdateMajorInput!): Major!
    deleteMajor(id: ID!): Major
  }
`;
