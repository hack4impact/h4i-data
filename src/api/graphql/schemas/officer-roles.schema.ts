export const officerRoleSchemaString = `
  enum RoleScope {
    CHAPTER
    CENTRAL
  }

  type OfficerRole {
    officer_role_id: ID!
    name: String!
    scope: RoleScope
    rank_level: Int
    created_at: String
    updated_at: String
  }

  type Query {
    officerRoles: [OfficerRole!]!
    officerRole(id: ID!): OfficerRole
  }

  input CreateOfficerRoleInput {
    name: String!
    scope: RoleScope
    rank_level: Int
  }

  input UpdateOfficerRoleInput {
    name: String
    scope: RoleScope
    rank_level: Int
  }

  type Mutation {
    createOfficerRole(input: CreateOfficerRoleInput!): OfficerRole!
    updateOfficerRole(id: ID!, input: UpdateOfficerRoleInput!): OfficerRole!
    deleteOfficerRole(id: ID!): OfficerRole
  }
`;
