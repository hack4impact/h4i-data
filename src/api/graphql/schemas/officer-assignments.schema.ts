export const officerAssignmentSchemaString = `
  type OfficerAssignment {
    assignment_id: ID!
    volunteer_id: ID
    role_id: ID
    chapter_id: ID
    start_date: String
    end_date: String
  }

  type Query {
    officerAssignments: [OfficerAssignment!]!
    officerAssignment(id: ID!): OfficerAssignment
  }

  input CreateOfficerAssignmentInput {
    volunteer_id: ID
    role_id: ID
    chapter_id: ID
    start_date: String
    end_date: String
  }

  input UpdateOfficerAssignmentInput {
    volunteer_id: ID
    role_id: ID
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
