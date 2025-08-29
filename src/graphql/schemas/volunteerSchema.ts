export const volunteerTypeDefs = `
  scalar Date

  enum VOLUNTEER_STATUS {
    STUDENT
    PROFESSIONAL
  }

  enum VOLUNTEER_TYPE {
    CHAPTER
    NATIONALS
    BOTH
  }

  type Volunteer {
    volunteer_id: ID!
    first_name: String!
    last_name: String!
    email: String!
    graduation_date: Date!
    volunteer_status: VOLUNTEER_STATUS!
    H4I_email: String
    volunteer_type: VOLUNTEER_TYPE!
    university_id: ID
    created_at: Date
    updated_at: Date
  }

  input VolunteerInput {
    first_name: String!
    last_name: String!
    email: String!
    graduation_date: Date!
    volunteer_status: VOLUNTEER_STATUS!
    H4I_email: String
    volunteer_type: VOLUNTEER_TYPE!
    university_id: ID!
  }

  input VolunteerUpdateInput {
    first_name: String
    last_name: String
    email: String
    graduation_date: Date
    volunteer_status: VOLUNTEER_STATUS
    H4I_email: String
    volunteer_type: VOLUNTEER_TYPE
    university_id: ID
  }

  type Query {
    volunteers: [Volunteer!]!
    volunteer(id: ID!): Volunteer
    volunteersByStatus(status: VOLUNTEER_STATUS!): [Volunteer!]!
    volunteersByType(type: VOLUNTEER_TYPE!): [Volunteer!]!
  }

  type Mutation {
    createVolunteer(input: VolunteerInput!): String!
    updateVolunteer(id: ID!, input: VolunteerUpdateInput!): String!
    deleteVolunteer(id: ID!): String!
  }
`;
