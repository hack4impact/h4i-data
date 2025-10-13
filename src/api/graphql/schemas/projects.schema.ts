export const projectSchemaString = `
  type Project {
    project_id: ID!
    name: String!
    description: String
    budget: Float
    repo: String
    created_at: String!
    updated_at: String!
    project_type: String
  }

  type Query {
    projects: [Project!]!
    project(id: ID!): Project
  }

  input CreateProjectInput {
    name: String!
    description: String
    budget: Float
    repo: String
    project_type: String
  }

  input UpdateProjectInput {
    name: String!
    description: String
    budget: Float
    repo: String
    project_type: String
  }

  type Mutation {
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: ID!, input: UpdateProjectInput!): Project!
    deleteProject(id: ID!): Project
  }
`;
