# GraphQL API Documentation

## Overview

The GraphQL API provides a flexible way to query and mutate operations data. The endpoint uses `graphql-http` (not Apollo), so there is no built-in playground — use an external GraphQL client or cURL.

**Integrated server** (`pnpm run dev`): `http://localhost:3001/api/graphql`
**Standalone server** (`pnpm run dev:graphql`): `http://localhost:3003/`

---

## Schema Structure

### Volunteer Entity

```graphql
type Volunteer {
  volunteer_id: ID!
  first_name: String!
  last_name: String!
  email: String!
  graduation_date: String!
  university_id: ID!
  volunteer_status: StatusType!
  h4i_email: String
  chapter_id: ID
  company_id: ID
  volunteer_type: VolunteerType!
  created_at: String!
  updated_at: String!
}

enum StatusType {
  STUDENT
  PROFESSIONAL
}

enum VolunteerType {
  OPERATIONS
  CHAPTER
  BOTH
}

type Query {
  volunteers: [Volunteer!]!
  volunteer(id: ID!): Volunteer
}

input CreateVolunteerInput {
  first_name: String
  last_name: String
  email: String
  graduation_date: String
  university_id: ID
  volunteer_status: StatusType
  volunteer_type: VolunteerType
  h4i_email: String
  chapter_id: ID
  company_id: ID
}

input UpdateVolunteerInput {
  first_name: String
  last_name: String
  email: String
  graduation_date: String
  university_id: ID
  volunteer_status: StatusType
  volunteer_type: VolunteerType
  h4i_email: String
  chapter_id: ID
  company_id: ID
}

type Mutation {
  createVolunteer(input: CreateVolunteerInput!): Volunteer!
  updateVolunteer(id: ID!, input: UpdateVolunteerInput!): Volunteer!
  deleteVolunteer(id: ID!): Volunteer
}
```

---

## Queries

### Get All Volunteers

```graphql
query {
  volunteers {
    volunteer_id
    first_name
    last_name
    email
    volunteer_status
  }
}
```

### Get Single Volunteer with Variables

```graphql
query GetVolunteer($id: ID!) {
  volunteer(id: $id) {
    volunteer_id
    first_name
    last_name
    email
    volunteer_status
  }
}
```

**Variables**:

```json
{
  "id": "your-volunteer-id-here"
}
```

---

## Mutations

### Create a Volunteer

```graphql
mutation CreateVolunteer($input: CreateVolunteerInput!) {
  createVolunteer(input: $input) {
    volunteer_id
    first_name
    last_name
    email
    graduation_date
    university_id
    volunteer_status
    volunteer_type
  }
}
```

**Input Type**:

```graphql
input CreateVolunteerInput {
  first_name: String
  last_name: String
  email: String
  graduation_date: String
  university_id: ID
  volunteer_status: StatusType
  volunteer_type: VolunteerType
  h4i_email: String
  chapter_id: ID
  company_id: ID
}
```

**Variables Example**:

```typescript
{
  input: {
    first_name: 'John',
    last_name: 'Doe',
    email:
      'john.doe' +
      Date.now() +
      Math.floor(Math.random() * 1000) +
      '@example.com',
    graduation_date: new Date('2026-06-18').toISOString(),
    volunteer_status: 'STUDENT',
    volunteer_type: 'BOTH',
    university_id: '07608837-420f-4697-bda2-701506079a9d', // Test UUID from Supabase
  },
}
```

### Update Volunteer (updating only first and last name)

```graphql
mutation UpdateVolunteer($id: ID!, $input: UpdateVolunteerInput!) {
  updateVolunteer(id: $id, input: $input) {
    volunteer_id
    first_name
    last_name
  }
}
```

**Input Type**:

```graphql
input UpdateVolunteerInput {
  first_name: String
  last_name: String
  email: String
  graduation_date: String
  university_id: ID
  volunteer_status: StatusType
  volunteer_type: VolunteerType
  h4i_email: String
  chapter_id: ID
  company_id: ID
}
```

### Delete a Volunteer

```graphql
mutation DeleteVolunteer($id: ID!) {
  deleteVolunteer(id: $id) {
    volunteer_id
  }
}
```

---

## Error Handling

GraphQL errors are returned in the standard GraphQL error format:

```graphql
{
  errors: [
    {
      message: 'Database error: Failed to retrieve volunteer',
      locations: [Array],
      path: [Array]
    }
  ],
  data: { volunteer: null }
}
```

### Common Error Codes

- `NOT_FOUND`: Resource doesn't exist
- `VALIDATION_ERROR`: Input validation failed
- `INTERNAL_ERROR`: Server error

---

## Validation Rules

### Volunteer Validation

- `first_name`: Minimum 2 characters, required for creation
- `last_name`: Minimum 2 characters, required for creation
- `email`: Must be a valid email address
- `graduation_date`: Must be valid ISO 8601 datetime string
- `volunteer_status`: Must be either `STUDENT` or `PROFESSIONAL`
- `h4i_email`: Optional field of a valid H4I email address
- `volunteer_type`: Must be either `CHAPTER` or `BOTH` or `OPERATIONS`
- `university_id`: Must be valid UUID format if provided
- `chapter_id`: Must be valid UUID format if provided
- `company_id`: Must be valid UUID format if provided

---

## Development Tools

### Introspection

Since `graphql-http` does not include a built-in playground, use a tool like [GraphQL Playground](https://github.com/graphql/graphql-playground), Postman, or Insomnia to explore the API. You can also use introspection queries via cURL.

### Top Level Introspection Query

Get the top level schema:

```graphql
query IntrospectionQuery {
  __schema {
    queryType {
      name
      fields {
        name
        type {
          name
          kind
        }
      }
    }
    mutationType {
      name
      fields {
        name
        type {
          name
          kind
        }
      }
    }
  }
}
```
