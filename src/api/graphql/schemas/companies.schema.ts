export const companySchemaString = `
  type Company {
    company_id: ID!
    name: String!
    location_id: ID
    created_at: String
    updated_at: String
  }

  input CreateCompanyInput {
    name: String!
    location_id: ID
  }

  input UpdateCompanyInput {
    name: String
    location_id: ID
  }

  type Query {
    company(id: ID!): Company
    companies: [Company!]!
  }

  type Mutation {
    createCompany(input: CreateCompanyInput!): Company!
    updateCompany(id: ID!, input: UpdateCompanyInput!): Company!
    deleteCompany(id: ID!): Company
  }
`;
