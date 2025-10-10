export const contactSchemaString = `
  type Contact {
    contact_id: ID!
    name: String!
    email: String!
    phone_number: String
    created_at: String!
    updated_at: String!
  }

  type Query {
    contacts: [Contact!]!
    contact(id: ID!): Contact
  }

  input CreateContactInput {
    name: String!
    email: String!
    phone_number: String
  }

  input UpdateContactInput {
    name: String
    email: String
    phone_number: String
  }

  type Mutation {
    createContact(input: CreateContactInput!): Contact!
    updateContact(id: ID!, input: UpdateContactInput!): Contact!
    deleteContact(id: ID!): Contact
  }
`;
