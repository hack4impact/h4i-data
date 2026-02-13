export const companySchemaString = `
  type Company {
    company_id: ID!
    name: String!
    industry_id: ID
    location_id: ID
    created_at: String
    updated_at: String
  }

  input CompanyCreateInput {
    name: String!
    industry_id: ID
    location_id: ID
  }

  input CompanyUpdateInput {
    name: String
    industry_id: ID
    location_id: ID
  }

  extend type Query {
    company(company_id: ID!): Company
    companies: [Company!]!
  }

  extend type Mutation {
    createCompany(input: CompanyCreateInput!): Company!
    updateCompany(company_id: ID!, input: CompanyUpdateInput!): Company!
    deleteCompany(company_id: ID!): Boolean!
  }
`;
