export const projectEngagementSchemaString = `
  enum DomainType {
    DESIGN_ONLY
    DEVELOP_ONLY
    FULL_STACK
    STRATEGY_CONSULT
    MAINTENANCE
  }

  type ProjectEngagement {
    engagement_id: ID!
    project_id: ID!
    partner_id: ID
    chapter_id: ID
    academic_term_id: ID
    client_contact_id: ID
    status: EngagementStatus
    domain: DomainType
    created_at: String
    updated_at: String
  }

  type Query {
    projectEngagements: [ProjectEngagement!]!
    projectEngagement(id: ID!): ProjectEngagement
  }

  input CreateProjectEngagementInput {
    project_id: ID!
    partner_id: ID
    chapter_id: ID
    academic_term_id: ID
    client_contact_id: ID
    status: EngagementStatus
    domain: DomainType
  }

  input UpdateProjectEngagementInput {
    project_id: ID
    partner_id: ID
    chapter_id: ID
    academic_term_id: ID
    client_contact_id: ID
    status: EngagementStatus
    domain: DomainType
  }

  type Mutation {
    createProjectEngagement(input: CreateProjectEngagementInput!): ProjectEngagement!
    updateProjectEngagement(id: ID!, input: UpdateProjectEngagementInput!): ProjectEngagement!
    deleteProjectEngagement(id: ID!): ProjectEngagement
  }
`;
