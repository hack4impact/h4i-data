# GraphQL API Documentation

## Overview

The GraphQL API provides a flexible way to query and mutate volunteer management data. The endpoint is available at `/api/graphql` with an interactive GraphQL playground for development.

**Base URL**: `http://localhost:3000/api/graphql`

---

## Schema Structure

### Chapter Entity

```graphql
type Chapter {
  chapter_id: ID!
  name: String!
  location_id: String
  founded_date: String!
  status_type: StatusType!
  created_at: String!
  updated_at: String!
}

enum StatusType {
  ACTIVE
  INACTIVE
}
```

---

## Queries

### Get All Chapters
```graphql
query {
  chapters {
    chapter_id
    name
    founded_date
    status_type
    location_id
    created_at
    updated_at
  }
}
```

### Get Single Chapter
```graphql
query GetChapter($id: ID!) {
  chapter(id: $id) {
    chapter_id
    name
    founded_date
    status_type
    location_id
    created_at
    updated_at
  }
}
```

**Variables**:
```json
{
  "id": "your-chapter-id-here"
}
```

---

## Mutations

### Create Chapter
```graphql
mutation CreateChapter($input: CreateChapterInput!) {
  createChapter(input: $input) {
    chapter_id
    name
    founded_date
    status_type
    location_id
    created_at
    updated_at
  }
}
```

**Input Type**:
```graphql
input CreateChapterInput {
  name: String!              # Required: Chapter name (min 3 chars)
  founded_date: String!      # Required: ISO 8601 datetime string
  status_type: StatusType    # Optional: Defaults to ACTIVE
  location_id: String        # Optional: UUID reference to location
}
```

**Variables Example**:
```json
{
  "input": {
    "name": "San Francisco Chapter",
    "founded_date": "2024-01-15T00:00:00.000Z",
    "status_type": "ACTIVE",
    "location_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Update Chapter
```graphql
mutation UpdateChapter($id: ID!, $input: UpdateChapterInput!) {
  updateChapter(id: $id, input: $input) {
    chapter_id
    name
    founded_date
    status_type
    location_id
    updated_at
  }
}
```

**Input Type**:
```graphql
input UpdateChapterInput {
  name: String               # Optional: Chapter name
  founded_date: String       # Optional: ISO 8601 datetime string
  status_type: StatusType    # Optional: ACTIVE or INACTIVE
  location_id: String        # Optional: UUID reference to location
}
```

### Delete Chapter
```graphql
mutation DeleteChapter($id: ID!) {
  deleteChapter(id: $id) {
    chapter_id
    name
  }
}
```

---

## Error Handling

GraphQL errors are returned in the standard GraphQL error format:

```json
{
  "errors": [
    {
      "message": "Chapter not found",
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ],
  "data": {
    "chapter": null
  }
}
```

### Common Error Codes
- `NOT_FOUND`: Resource doesn't exist
- `VALIDATION_ERROR`: Input validation failed
- `INTERNAL_ERROR`: Server error

---

## Validation Rules

### Chapter Validation
- `name`: Minimum 3 characters, required for creation
- `founded_date`: Must be valid ISO 8601 datetime string
- `status_type`: Must be either `ACTIVE` or `INACTIVE`
- `location_id`: Must be valid UUID format if provided

---

## Development Tools

### GraphQL Playground
Visit `http://localhost:3000/api/graphql` in your browser for an interactive query editor with:
- Schema exploration
- Query autocompletion
- Real-time error validation
- Query history

### Introspection Query
Get the full schema:
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