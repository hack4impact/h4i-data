export const locationSchemaString = `
  type Location {
    location_id: ID!
    name: String!
    address: String!
    country_code: String!
    subdivision_code: String!
    created_at: String!
    updated_at: String!
  }

  type Query {
    locations: [Location!]!
    location(id: ID!): Location
  }

  input CreateLocationInput {
    name: String!
    address: String!
    country_code: String!
    subdivision_code: String!
  }

  input UpdateLocationInput {
    name: String
    address: String
    country_code: String
    subdivision_code: String
  }

  type Mutation {
    createLocation(input: CreateLocationInput!): Location!
    updateLocation(id: ID!, input: UpdateLocationInput!): Location!
    deleteLocation(id: ID!): Location
  }
`;
