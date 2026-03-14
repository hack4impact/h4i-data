export const projectDeliverableSchemaString = `
  enum ProjectResourceType {
    CODE
    DESIGNS
    REQUIREMENTS
    LIVE_URL
    DOCUMENTATION
  }

  type ProjectResource {
    project_resource_id: ID!
    project_id: ID!
    label: String
    url: String
    category: ProjectResourceType
    created_at: String
    updated_at: String
  }

  type Query {
    projectResources: [ProjectResource!]!
    projectResource(id: ID!): ProjectResource
  }

  input CreateProjectResourceInput {
    project_id: ID!
    label: String
    url: String
    category: ProjectResourceType
  }

  input UpdateProjectResourceInput {
    project_id: ID
    label: String
    url: String
    category: ProjectResourceType
  }

  type Mutation {
    createProjectResource(input: CreateProjectResourceInput!): ProjectResource!
    updateProjectResource(id: ID!, input: UpdateProjectResourceInput!): ProjectResource!
    deleteProjectResource(id: ID!): ProjectResource
  }
`;
