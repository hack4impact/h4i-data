export const officerAssignmentSchemaString = `
  type OfficerAssignment {
    officer_assignment_id: ID!
    volunteer_id: ID!
    officer_role_id: ID!
    chapter_id: ID!
    start_date: String
    end_date: String
    created_at: String
    updated_at: String
  }

  type Query {
    officerAssignments: [OfficerAssignment!]!
    officerAssignment(id: ID!): OfficerAssignment
  }

  input CreateOfficerAssignmentInput {
    volunteer_id: ID!
    officer_role_id: ID!
    chapter_id: ID!
    start_date: String
    end_date: String
  }

  input UpdateOfficerAssignmentInput {
    volunteer_id: ID
    officer_role_id: ID
    chapter_id: ID
    start_date: String
    end_date: String
  }

  type Mutation {
    createOfficerAssignment(input: CreateOfficerAssignmentInput!): OfficerAssignment!
    updateOfficerAssignment(id: ID!, input: UpdateOfficerAssignmentInput!): OfficerAssignment!
    deleteOfficerAssignment(id: ID!): OfficerAssignment
  }
`;
