export const projectDeliverableSchemaString = `
  enum ProjectResourceType {
    CODE
    DESIGNS
    REQUIREMENTS
    LIVE_URL
    DOCUMENTATION
  }

  type ProjectDeliverable {
    deliverable_id: ID!
    project_id: ID!
    label: String
    url: String
    category: ProjectResourceType
    created_at: String
    updated_at: String
  }

  type Query {
    projectDeliverables: [ProjectDeliverable!]!
    projectDeliverable(id: ID!): ProjectDeliverable
  }

  input CreateProjectDeliverableInput {
    project_id: ID!
    label: String
    url: String
    category: ProjectResourceType
  }

  input UpdateProjectDeliverableInput {
    project_id: ID
    label: String
    url: String
    category: ProjectResourceType
  }

  type Mutation {
    createProjectDeliverable(input: CreateProjectDeliverableInput!): ProjectDeliverable!
    updateProjectDeliverable(id: ID!, input: UpdateProjectDeliverableInput!): ProjectDeliverable!
    deleteProjectDeliverable(id: ID!): ProjectDeliverable
  }
`;
