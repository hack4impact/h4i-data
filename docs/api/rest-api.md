# REST API Documentation

## Overview

The REST API follows RESTful conventions and provides endpoints for managing volunteer data. All endpoints return JSON responses and use standard HTTP status codes.

**Base URL**: `http://localhost:3000/api/rest`

---

## Authentication

Currently no authentication is required. Future versions may include JWT or API key authentication.

---

## Response Format

All responses follow a consistent JSON format:

### Success Response
```json
{
  "chapter_id": "uuid",
  "name": "Chapter Name",
  "founded_date": "2024-01-15T00:00:00.000Z",
  "status_type": "ACTIVE",
  "location_id": "uuid",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional error information (optional)"
}
```

---

## Chapters Endpoints

### Get All Chapters
**GET** `/chapters`

**Description**: Retrieve all chapters from the database.

**Response**: `200 OK`
```json
[
  {
    "chapter_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "San Francisco Chapter",
    "founded_date": "2024-01-15T00:00:00.000Z",
    "status_type": "ACTIVE",
    "location_id": "660e8400-e29b-41d4-a716-446655440001",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

**Error Responses**:
- `500 Internal Server Error`: Database connection or server error

---

### Get Chapter by ID
**GET** `/chapters/:id`

**Description**: Retrieve a specific chapter by its ID.

**Parameters**:
- `id` (path): Chapter UUID

**Response**: `200 OK`
```json
{
  "chapter_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "San Francisco Chapter",
  "founded_date": "2024-01-15T00:00:00.000Z",
  "status_type": "ACTIVE",
  "location_id": "660e8400-e29b-41d4-a716-446655440001",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `404 Not Found`: Chapter doesn't exist
- `500 Internal Server Error`: Server error

---

### Create Chapter
**POST** `/chapters`

**Description**: Create a new chapter.

**Request Body**:
```json
{
  "name": "New Chapter Name",
  "founded_date": "2024-01-15T00:00:00.000Z",
  "status_type": "ACTIVE",
  "location_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Required Fields**:
- `name`: String (minimum 3 characters)
- `founded_date`: ISO 8601 datetime string

**Optional Fields**:
- `status_type`: "ACTIVE" | "INACTIVE" (defaults to "ACTIVE")
- `location_id`: UUID string

**Response**: `201 Created`
```json
{
  "chapter_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "New Chapter Name",
  "founded_date": "2024-01-15T00:00:00.000Z",
  "status_type": "ACTIVE",
  "location_id": "660e8400-e29b-41d4-a716-446655440001",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

---

### Update Chapter
**PATCH** `/chapters/:id`

**Description**: Update an existing chapter. Only provided fields will be updated.

**Parameters**:
- `id` (path): Chapter UUID

**Request Body** (all fields optional):
```json
{
  "name": "Updated Chapter Name",
  "founded_date": "2024-02-15T00:00:00.000Z",
  "status_type": "INACTIVE",
  "location_id": "770e8400-e29b-41d4-a716-446655440002"
}
```

**Response**: `200 OK`
```json
{
  "chapter_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Updated Chapter Name",
  "founded_date": "2024-02-15T00:00:00.000Z",
  "status_type": "INACTIVE",
  "location_id": "770e8400-e29b-41d4-a716-446655440002",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-03-15T11:45:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Validation error
- `404 Not Found`: Chapter doesn't exist
- `500 Internal Server Error`: Server error

---

### Delete Chapter
**DELETE** `/chapters/:id`

**Description**: Delete a chapter by ID.

**Parameters**:
- `id` (path): Chapter UUID

**Response**: `204 No Content`

**Error Responses**:
- `404 Not Found`: Chapter doesn't exist
- `500 Internal Server Error`: Server error

---

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET/PATCH request |
| 201 | Created | Successful POST request |
| 204 | No Content | Successful DELETE request |
| 400 | Bad Request | Validation error or malformed request |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server or database error |

---

## Request/Response Examples

### cURL Examples

**Get all chapters**:
```bash
curl -X GET http://localhost:3000/api/rest/chapters
```

**Create a chapter**:
```bash
curl -X POST http://localhost:3000/api/rest/chapters \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Austin Chapter",
    "founded_date": "2024-03-15T00:00:00.000Z",
    "status_type": "ACTIVE"
  }'
```

**Update a chapter**:
```bash
curl -X PATCH http://localhost:3000/api/rest/chapters/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Austin Chapter - Updated"
  }'
```

**Delete a chapter**:
```bash
curl -X DELETE http://localhost:3000/api/rest/chapters/550e8400-e29b-41d4-a716-446655440000
```

---

## Validation Rules

### Chapter Validation
- **name**: 
  - Required for creation
  - Minimum 3 characters
  - String type
- **founded_date**: 
  - Required for creation
  - Must be valid ISO 8601 datetime format
  - Example: `"2024-01-15T00:00:00.000Z"`
- **status_type**: 
  - Optional (defaults to "ACTIVE")
  - Must be either "ACTIVE" or "INACTIVE"
- **location_id**: 
  - Optional
  - Must be valid UUID format if provided

### Error Response Format
When validation fails, you'll receive a `400 Bad Request` with details:

```json
{
  "error": "Invalid data",
  "details": {
    "_errors": [],
    "name": {
      "_errors": ["String must contain at least 3 character(s)"]
    }
  }
}
```