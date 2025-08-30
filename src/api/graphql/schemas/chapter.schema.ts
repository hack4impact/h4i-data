export const chapterTypeDefs = `#graphql
  # Using the enum from your Prisma schema
  enum StatusType {
    ACTIVE
    INACTIVE
  }

  type Chapter {
    chapter_id: ID!
    name: String!
    location_id: String
    founded_date: String!
    status_type: StatusType!
    created_at: String!
    updated_at: String!
  }

  type Query {
    chapters: [Chapter!]!
    chapter(id: ID!): Chapter
  }

  input CreateChapterInput {
    name: String!
    founded_date: String! # Using String for dates in GraphQL is common
    status_type: StatusType
    location_id: String
  }

  input UpdateChapterInput {
    name: String
    founded_date: String
    status_type: StatusType
    location_id: String
  }

  type Mutation {
    createChapter(input: CreateChapterInput!): Chapter!
    updateChapter(id: ID!, input: UpdateChapterInput!): Chapter!
    deleteChapter(id: ID!): Chapter
  }
`;
