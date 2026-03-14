export const volunteerSchemaString = `
  type Volunteer {
    volunteer_id: ID!
    org_email: String
    status: VolunteerStatus
    volunteer_class: VolunteerClass
    engagement_track: EngagementTrack
    major_id: ID
    education_level: EducationLevel
    graduation_term_id: ID
    university_id: ID
    home_chapter_id: ID
    employer_id: ID
    created_at: String
    updated_at: String
    constituent: Constituent
  }

  type Query {
    volunteers: [Volunteer!]!
    volunteer(id: ID!): Volunteer
  }

  input CreateVolunteerInput {
    volunteer_id: ID!
    org_email: String
    status: VolunteerStatus
    volunteer_class: VolunteerClass
    engagement_track: EngagementTrack
    major_id: ID
    education_level: EducationLevel
    graduation_term_id: ID
    university_id: ID
    home_chapter_id: ID
    employer_id: ID
  }

  input UpdateVolunteerInput {
    org_email: String
    status: VolunteerStatus
    volunteer_class: VolunteerClass
    engagement_track: EngagementTrack
    major_id: ID
    education_level: EducationLevel
    graduation_term_id: ID
    university_id: ID
    home_chapter_id: ID
    employer_id: ID
  }

  type Mutation {
    createVolunteer(input: CreateVolunteerInput!): Volunteer!
    updateVolunteer(id: ID!, input: UpdateVolunteerInput!): Volunteer!
    deleteVolunteer(id: ID!): Volunteer
  }
`;
