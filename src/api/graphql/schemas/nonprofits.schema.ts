export const nonprofitSchemaString = `
  enum NonprofitSortOption {
    A_TO_Z
    Z_TO_A
    MOST_RECENT
    STATUS
  }

  type NonprofitChapterProjectInfo {
    nonprofit_chapter_project_id: ID!
    nonprofit_id: ID!
    chapter: Chapter
    project: Project!
    project_status: StatusType!
    start_date: String!
    end_date: String
    notes: String
    project_contact: Contact
    collab_contact: Contact
    created_at: String!
    updated_at: String!
  }

  type Nonprofit {
    nonprofit_id: ID!
    name: String!
    mission: String!
    website: String
    location_id: String
    contact_id: String!
    created_at: String!
    updated_at: String!
    status: StatusType!
    chapter_projects: [NonprofitChapterProjectInfo!]!
  }

  type Query {
    nonprofits(
      chapterNames: [String!]
      statuses: [StatusType!]
      sort: [NonprofitSortOption!]
    ): [Nonprofit!]!

    nonprofit(id: ID!): Nonprofit
  }

  input CreateNonprofitInput {
    name: String!
    mission: String!
    contact_id: String!
    website: String
    location_id: String
  }

  input UpdateNonprofitInput {
    name: String
    mission: String
    contact_id: String
    website: String
    location_id: String
  }

  type Mutation {
    createNonprofit(input: CreateNonprofitInput!): Nonprofit!
    updateNonprofit(nonprofit_id: ID!, input: UpdateNonprofitInput!): Nonprofit!
    deleteNonprofit(id: ID!): Nonprofit
  }
`;
