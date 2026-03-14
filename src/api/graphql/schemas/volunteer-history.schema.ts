export const volunteerHistorySchemaString = `
  enum ActionType {
    ENROLLED
    PROMOTED
    DEMOTED
    ROLE_CHANGE
    GRADUATED
    RESIGNED
    HIATUS
  }

  enum EntityType {
    CHAPTER
    OFFICER_ROLE
    PROJECT
    PROJECT_ROLE
    ENGAGEMENT
    UNIVERSITY
    COMPANY
  }

  type VolunteerHistory {
    volunteer_history_id: ID!
    volunteer_id: ID!
    action_type: ActionType!
    related_entity_id: ID
    related_entity_type: EntityType
    previous_value_label: String
    new_value_label: String
    effective_date: String!
    created_at: String
    updated_at: String
  }

  type Query {
    volunteerHistories: [VolunteerHistory!]!
    volunteerHistory(id: ID!): VolunteerHistory
  }

  input CreateVolunteerHistoryInput {
    volunteer_id: ID!
    action_type: ActionType!
    related_entity_id: ID
    previous_value_label: String
    new_value_label: String
    effective_date: String!
  }

  input UpdateVolunteerHistoryInput {
    volunteer_id: ID
    action_type: ActionType
    related_entity_id: ID
    previous_value_label: String
    new_value_label: String
    effective_date: String
  }

  type Mutation {
    createVolunteerHistory(input: CreateVolunteerHistoryInput!): VolunteerHistory!
    updateVolunteerHistory(id: ID!, input: UpdateVolunteerHistoryInput!): VolunteerHistory!
    deleteVolunteerHistory(id: ID!): VolunteerHistory
  }
`;
