export const academicTermSchemaString = `
  enum TermType {
    SEMESTER
    QUARTER
    TRIMESTER
  }

  type AcademicTerm {
    term_id: ID!
    university_id: ID
    name: String
    canonical_label: String
    type: TermType
    start_date: String
    end_date: String
  }

  type Query {
    academicTerms: [AcademicTerm!]!
    academicTerm(id: ID!): AcademicTerm
  }

  input CreateAcademicTermInput {
    university_id: ID
    name: String
    canonical_label: String
    type: TermType
    start_date: String
    end_date: String
  }

  input UpdateAcademicTermInput {
    university_id: ID
    name: String
    canonical_label: String
    type: TermType
    start_date: String
    end_date: String
  }

  type Mutation {
    createAcademicTerm(input: CreateAcademicTermInput!): AcademicTerm!
    updateAcademicTerm(id: ID!, input: UpdateAcademicTermInput!): AcademicTerm!
    deleteAcademicTerm(id: ID!): AcademicTerm
  }
`;
