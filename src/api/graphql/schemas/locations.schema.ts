export const locationSchemaString = `
  type Location {
    location_id: ID!
    name: String!
    address_line: String
    city: String
    state_code: String
    postal_code: String
    country_code: String
    created_at: String
    updated_at: String
  }

  type Query {
    locations: [Location!]!
    location(id: ID!): Location
  }

  input CreateLocationInput {
    name: String!
    address_line: String
    city: String
    state_code: String
    postal_code: String
    country_code: String
  }

  input UpdateLocationInput {
    name: String
    address_line: String
    city: String
    state_code: String
    postal_code: String
    country_code: String
  }

  type Mutation {
    createLocation(input: CreateLocationInput!): Location!
    updateLocation(id: ID!, input: UpdateLocationInput!): Location!
    deleteLocation(id: ID!): Location
  }
`;
