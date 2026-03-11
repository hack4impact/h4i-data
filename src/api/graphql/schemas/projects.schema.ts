export const projectSchemaString = `
  enum ProjectStatus {
    WORKING
    ACTIVE
    INACTIVE
    ARCHIVED
  }

  type Project {
    project_id: ID!
    name: String!
    github_url: String
    status: ProjectStatus
    created_at: String
    updated_at: String
  }

  type Query {
    projects(sortOrder: String): [Project!]!
    project(id: ID!): Project
  }

  input CreateProjectInput {
    name: String!
    github_url: String
    status: ProjectStatus
  }

  input UpdateProjectInput {
    name: String
    github_url: String
    status: ProjectStatus
  }

  type Mutation {
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: ID!, input: UpdateProjectInput!): Project!
    deleteProject(id: ID!): Project
  }
`;
