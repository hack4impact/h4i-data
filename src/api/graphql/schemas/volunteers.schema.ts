export const volunteerSchemaString = `
  # Using the enum from your Prisma schema
  enum StatusType {
    STUDENT
    PROFESSIONAL
  }

  enum VolunteerType {
    NATIONALS
    CHAPTER
    BOTH
  }

  type Volunteer {
    volunteer_id: ID!
    first_name: String!
    last_name: String!
    email: String!
    graduation_date: String!
    university_id: ID!
    volunteer_status: StatusType!
    h4i_email: String
    chapter_id: ID
    company_id: ID
    volunteer_type: VolunteerType!
    created_at: String!
    updated_at: String!
  }

  type Query {
    volunteers: [Volunteer!]!
    volunteer(id: ID!): Volunteer
  }

  input CreateVolunteerInput {
    first_name: String
    last_name: String
    email: String
    graduation_date: String
    university_id: ID
    volunteer_status: StatusType
    volunteer_type: VolunteerType
    h4i_email: String
    chapter_id: ID
    company_id: ID
  }

  input UpdateVolunteerInput {
    first_name: String
    last_name: String
    email: String
    graduation_date: String
    university_id: ID
    volunteer_status: StatusType
    volunteer_type: VolunteerType
    h4i_email: String
    chapter_id: ID
    company_id: ID
  }

  type Mutation {
    createVolunteer(input: CreateVolunteerInput!): Volunteer!
    updateVolunteer(id: ID!, input: UpdateVolunteerInput!): Volunteer!
    deleteVolunteer(id: ID!): Volunteer
  }

`;
