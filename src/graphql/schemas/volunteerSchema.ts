export const volunteerTypeDefs = `
  type Volunteer {
    volunteer_id: ID!
    first_name: String!
    last_name: String!
    email: String!
  }

  input VolunteerInput {
    first_name: String!
    last_name: String!
    email: String!
    graduation_date: String!
    volunteer_status: String!
    volunteer_type: String!
    university_id: String!
  }

  type Query {
    volunteers: [Volunteer!]!
  }

  type Mutation {
    createVolunteer(input: VolunteerInput!): Volunteer!
  }
`;
