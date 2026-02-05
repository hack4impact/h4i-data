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

  type VolunteerHistory {
    history_id: ID!
    volunteer_id: ID
    action_type: ActionType
    related_entity_id: ID
    previous_value_label: String
    new_value_label: String
    effective_date: String
  }

  type Query {
    volunteerHistories: [VolunteerHistory!]!
    volunteerHistory(id: ID!): VolunteerHistory
  }

  input CreateVolunteerHistoryInput {
    volunteer_id: ID
    action_type: ActionType
    related_entity_id: ID
    previous_value_label: String
    new_value_label: String
    effective_date: String
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
