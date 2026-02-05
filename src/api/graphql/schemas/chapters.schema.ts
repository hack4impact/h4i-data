export const chapterSchemaString = `
  type Chapter {
    chapter_id: ID!
    name: String
    university_id: ID
    location_id: ID
    founded_date: String
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
  }

  input UpdateChapterInput {
    name: String
    university_id: ID
    location_id: ID
    founded_date: String
  }

  type Mutation {
    createChapter(input: CreateChapterInput!): Chapter!
    updateChapter(id: ID!, input: UpdateChapterInput!): Chapter!
    deleteChapter(id: ID!): Chapter
  }
`;
