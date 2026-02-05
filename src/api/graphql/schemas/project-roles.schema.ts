export const projectRoleSchemaString = `
  type ProjectRole {
    role_id: ID!
    name: String
    is_leadership: Boolean
  }

  type Query {
    projectRoles: [ProjectRole!]!
    projectRole(id: ID!): ProjectRole
  }

  input CreateProjectRoleInput {
    name: String
    is_leadership: Boolean
  }

  input UpdateProjectRoleInput {
    name: String
    is_leadership: Boolean
  }

  type Mutation {
    createProjectRole(input: CreateProjectRoleInput!): ProjectRole!
    updateProjectRole(id: ID!, input: UpdateProjectRoleInput!): ProjectRole!
    deleteProjectRole(id: ID!): ProjectRole
  }
`;
