export const projectEngagementSchemaString = `
  enum FinancialType {
    PRO_BONO
    INTERNAL
    PAID_CONSULT
  }

  enum ProjectType {
    DESIGN_ONLY
    DEVELOP_ONLY
    FULL_STACK
    STRATEGY_CONSULT
    MAINTENANCE
  }

  type ProjectEngagement {
    project_engagement_id: ID!
    project_id: ID!
    partner_id: ID
    chapter_id: ID
    academic_term_id: ID
    client_contact_id: ID
    status: EngagementStatus
    domain: ProjectType
    financial: FinancialType
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
    domain: ProjectType
    financial: FinancialType
  }

  input UpdateProjectEngagementInput {
    project_id: ID
    partner_id: ID
    chapter_id: ID
    academic_term_id: ID
    client_contact_id: ID
    status: EngagementStatus
    domain: ProjectType
    financial: FinancialType
  }

  type Mutation {
    createProjectEngagement(input: CreateProjectEngagementInput!): ProjectEngagement!
    updateProjectEngagement(id: ID!, input: UpdateProjectEngagementInput!): ProjectEngagement!
    deleteProjectEngagement(id: ID!): ProjectEngagement
  }
`;
