export const universitySchemaString = `
  type University {
    university_id: ID!
    name: String!
    email_domain: String
    location_id: ID
    created_at: String
    updated_at: String
  }

  type Query {
    universities: [University!]!
    university(id: ID!): University
  }

  input CreateUniversityInput {
    name: String!
    email_domain: String
    location_id: ID
  }

  input UpdateUniversityInput {
    name: String
    email_domain: String
    location_id: ID
  }

  type Mutation {
    createUniversity(input: CreateUniversityInput!): University!
    updateUniversity(id: ID!, input: UpdateUniversityInput!): University!
    deleteUniversity(id: ID!): University
  }
`;
