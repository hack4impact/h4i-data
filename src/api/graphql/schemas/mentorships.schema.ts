export const mentorshipSchemaString = `
  enum EngagementStatus {
    PROSPECT
    ACTIVE
    COMPLETED
    ON_HOLD
  }

  type Mentorship {
    mentorship_id: ID!
    mentor_id: ID!
    mentee_id: ID!
    program_type: String
    status: EngagementStatus
    start_date: String
    end_date: String
    notes: String
    created_at: String
    updated_at: String
  }

  type Query {
    mentorships: [Mentorship!]!
    mentorship(id: ID!): Mentorship
  }

  input CreateMentorshipInput {
    mentor_id: ID!
    mentee_id: ID!
    program_type: String
    status: EngagementStatus
    start_date: String
    end_date: String
    notes: String
  }

  input UpdateMentorshipInput {
    program_type: String
    status: EngagementStatus
    start_date: String
    end_date: String
    notes: String
  }

  type Mutation {
    createMentorship(input: CreateMentorshipInput!): Mentorship!
    updateMentorship(id: ID!, input: UpdateMentorshipInput!): Mentorship!
    deleteMentorship(id: ID!): Mentorship
  }
`;
