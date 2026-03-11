export const mentorSchemaString = `
  type Mentor {
    mentor_id: ID!
    status: VolunteerStatus
    expertise_area: String
    max_mentees: Int
    created_at: String
    updated_at: String
    constituent: Constituent
  }

  type Query {
    mentors: [Mentor!]!
    mentor(id: ID!): Mentor
  }

  input CreateMentorInput {
    mentor_id: ID!
    status: VolunteerStatus
    expertise_area: String
    max_mentees: Int
  }

  input UpdateMentorInput {
    status: VolunteerStatus
    expertise_area: String
    max_mentees: Int
  }

  type Mutation {
    createMentor(input: CreateMentorInput!): Mentor!
    updateMentor(id: ID!, input: UpdateMentorInput!): Mentor!
    deleteMentor(id: ID!): Mentor
  }
`;
