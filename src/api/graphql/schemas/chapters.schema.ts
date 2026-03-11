export const chapterSchemaString = `
  enum ChapterStatus {
    PROSPECT
    FORMING
    ACTIVE
    INACTIVE
    SUSPENDED
  }

  type Chapter {
    chapter_id: ID!
    name: String!
    university_id: ID
    location_id: ID
    founded_date: String
    status: ChapterStatus
    created_at: String
    updated_at: String
  }

  type Query {
    chapters: [Chapter!]!
    chapter(id: ID!): Chapter
  }

  input CreateChapterInput {
    name: String!
    university_id: ID
    location_id: ID
    founded_date: String
    status: ChapterStatus
  }

  input UpdateChapterInput {
    name: String
    university_id: ID
    location_id: ID
    founded_date: String
    status: ChapterStatus
  }

  type Mutation {
    createChapter(input: CreateChapterInput!): Chapter!
    updateChapter(id: ID!, input: UpdateChapterInput!): Chapter!
    deleteChapter(id: ID!): Chapter
  }
`;
