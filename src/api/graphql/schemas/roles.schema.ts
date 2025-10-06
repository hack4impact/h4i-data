export const roleSchemaString = `

scalar JSON

  type Role {
    role_id: ID!
    name: String!
    description: String
    permissions: JSON
    level_type: String
  }

  type Query {
    roles: [Role!]!
    role(id: ID!): Role
  }

  input CreateRoleInput {
    name: String!
    description: String
    permissions: JSON
    level_type: String
  }

  input UpdateRoleInput {
    name: String
    description: String
    permissions: JSON
    level_type: String
  }

  type Mutation {
    createRole(input: CreateRoleInput!): Role!
    updateRole(id: ID!, input: UpdateRoleInput!): Role!
    deleteRole(id: ID!): Role
  }
`;
