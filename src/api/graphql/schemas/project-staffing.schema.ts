export const projectStaffingSchemaString = `
  type ProjectStaffing {
    staffing_id: ID!
    volunteer_id: ID!
    engagement_id: ID!
    role_id: ID
    is_lead_contact: Boolean
    start_date: String
    end_date: String
    created_at: String
    updated_at: String
  }

  type Query {
    projectStaffings: [ProjectStaffing!]!
    projectStaffing(id: ID!): ProjectStaffing
  }

  input CreateProjectStaffingInput {
    volunteer_id: ID!
    engagement_id: ID!
    role_id: ID
    is_lead_contact: Boolean
    start_date: String
    end_date: String
  }

  input UpdateProjectStaffingInput {
    volunteer_id: ID
    engagement_id: ID
    role_id: ID
    is_lead_contact: Boolean
    start_date: String
    end_date: String
  }

  type Mutation {
    createProjectStaffing(input: CreateProjectStaffingInput!): ProjectStaffing!
    updateProjectStaffing(id: ID!, input: UpdateProjectStaffingInput!): ProjectStaffing!
    deleteProjectStaffing(id: ID!): ProjectStaffing
  }
`;
