export const partnerSchemaString = `
  type Partner {
    partner_id: ID!
    legal_name: String!
    mission_statement: String
    website_url: String
    pcs_organization_type: String
    pcs_subject: String
    pcs_population: String
    created_at: String
    updated_at: String
  }

  type Query {
    partners: [Partner!]!
    partner(id: ID!): Partner
  }

  input CreatePartnerInput {
    legal_name: String!
    mission_statement: String
    website_url: String
    pcs_organization_type: String
    pcs_subject: String
    pcs_population: String
  }

  input UpdatePartnerInput {
    legal_name: String
    mission_statement: String
    website_url: String
    pcs_organization_type: String
    pcs_subject: String
    pcs_population: String
  }

  type Mutation {
    createPartner(input: CreatePartnerInput!): Partner!
    updatePartner(id: ID!, input: UpdatePartnerInput!): Partner!
    deletePartner(id: ID!): Partner
  }
`;
