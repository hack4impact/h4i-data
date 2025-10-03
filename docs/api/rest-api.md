# REST API Documentation

## Overview

The REST API follows RESTful conventions and provides endpoints for managing volunteer data. All endpoints return JSON responses and use standard HTTP status codes.

**Base URL**: `http://localhost:3002/api/rest` for npm run dev:rest
**Base URL**: `http://localhost:3001/api/rest` for npm run dev

---

## Authentication

Currently no authentication is required. Future versions may include JWT or API key authentication.

---

## Response Format

All responses follow a consistent JSON format:

### Success Response

```json
{
    "volunteer_id": "08ca0169-5c9c-4e1b-9557-b5bb1b294bfe",
    "first_name": "Alice",
    "last_name": "Johnson",
    "email": "alice@example.com",
    "graduation_date": "2026-06-18T00:00:00.000Z",
    "university_id": "07608837-420f-4697-bda2-701506079a9d",
    "volunteer_status": "STUDENT",
    "H4I_email": null,
    "chapter_id": null,
    "volunteer_type": "CHAPTER",
    "created_at": "2025-10-03T04:52:44.887Z",
    "updated_at": "2025-10-03T04:52:44.887Z",
    "company_id": null
}
```

### Error Response

```json
{
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "Current Timestamp",
  "requestId": "Request ID",
  "details": "Error information",
  "stack": "Additional error information"
}
```

---

## Volunteers Endpoints

### Get All Volunteers

**GET** `/volunteers`

**Description**: Retrieve all volunteers from the database.

**Response**: `200 OK`

```json
[
  {
      "volunteer_id": "08ca0169-5c9c-4e1b-9557-b5bb1b294bfe",
      "first_name": "Alice",
      "last_name": "Johnson",
      "email": "alice@example.com",
      "graduation_date": "2026-06-18T00:00:00.000Z",
      "university_id": "07608837-420f-4697-bda2-701506079a9d",
      "volunteer_status": "STUDENT",
      "H4I_email": null,
      "chapter_id": null,
      "volunteer_type": "CHAPTER",
      "created_at": "2025-10-03T04:52:44.887Z",
      "updated_at": "2025-10-03T04:52:44.887Z",
      "company_id": null
  },
  {
      "volunteer_id": "0a35549d-c9c6-42fe-9723-6f80cd0fa572",
      "first_name": "New Updated John",
      "last_name": "New Updated Smith",
      "email": "john.doe175945307185846@example.com",
      "graduation_date": "2026-06-18T00:00:00.000Z",
      "university_id": "07608837-420f-4697-bda2-701506079a9d",
      "volunteer_status": "STUDENT",
      "H4I_email": null,
      "chapter_id": null,
      "volunteer_type": "BOTH",
      "created_at": "2025-10-03T00:57:51.863Z",
      "updated_at": "2025-10-03T00:57:51.863Z",
      "company_id": null
  },
]
```

**Error Responses**:

- `500 Internal Server Error`: Database connection or server error

---

### Get a Volunteer by ID

**GET** `/volunteers/:id`

**Description**: Retrieve a specific volunteer by its ID.

**Parameters**:

- `id` (path): Volunteer UUID

**Response**: `200 OK`

```json
{
    "volunteer_id": "661bb298-b237-4925-8d16-aa6673063cf0",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe1759003071414392@example.com",
    "graduation_date": "2026-06-18T00:00:00.000Z",
    "university_id": "07608837-420f-4697-bda2-701506079a9d",
    "volunteer_status": "STUDENT",
    "H4I_email": null,
    "chapter_id": null,
    "volunteer_type": "BOTH",
    "created_at": "2025-09-27T19:57:51.418Z",
    "updated_at": "2025-09-27T19:57:51.418Z",
    "company_id": null
}
```

**Error Responses**:

- `404 Not Found`: Volunteer doesn't exist
- `500 Internal Server Error`: Server error

---

### Create a Volunteer

**POST** `/volunteers`

**Description**: Create a new volunteer.

**Request Body**:

```json
{
  "first_name": "Alice",
  "last_name": "Johnson",
  "email": "alice@example.com",
  "graduation_date": "2026-06-18T00:00:00.000Z",
  "volunteer_status": "STUDENT",
  "volunteer_type": "CHAPTER",
  "university_id": "07608837-420f-4697-bda2-701506079a9d"
}
```

**Required Fields**:

- `first_name`: String (minimum 2 characters)
- `last_name`: String (minimum 2 characters)
- `email`: Valid email
- `graduation_date`: ISO 8601 datetime string
- `volunteer_status`: "STUDENT" or "PROFESSIONAL"
- `volunteer_type`: "CHAPTER" or "BOTH" or "OPERATIONS"
- `university_id`: UUID string

**Optional Fields**:

- `h4i_email`: Valid email
- `chapter_id`: UUID string
- `company_id`: UUID string

**Response**: `201 Created`

```json
{
    "volunteer_id": "08ca0169-5c9c-4e1b-9557-b5bb1b294bfe",
    "first_name": "Alice",
    "last_name": "Johnson",
    "email": "alice@example.com",
    "graduation_date": "2026-06-18T00:00:00.000Z",
    "university_id": "07608837-420f-4697-bda2-701506079a9d",
    "volunteer_status": "STUDENT",
    "H4I_email": null,
    "chapter_id": null,
    "volunteer_type": "CHAPTER",
    "created_at": "2025-10-03T04:52:44.887Z",
    "updated_at": "2025-10-03T04:52:44.887Z",
    "company_id": null
}
```

**Error Responses**:

- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

---

### Update Volunteer

**PATCH** `/volunteers/:id`

**Description**: Update an existing volunteer. Only provided fields will be updated.

**Parameters**:

- `id` (path): Volunteer UUID

**Request Body** (all fields optional):

```json
{
  "first_name": "Newly Updated First Name",
  "last_name": "Newly Updated Last Name"
}

```

**Response**: `200 OK`

```json
{
    "volunteer_id": "661bb298-b237-4925-8d16-aa6673063cf0",
    "first_name": "Newly Updated First Name",
    "last_name": "Newly Updated Last Name",
    "email": "john.doe1759003071414392@example.com",
    "graduation_date": "2026-06-18T00:00:00.000Z",
    "university_id": "07608837-420f-4697-bda2-701506079a9d",
    "volunteer_status": "STUDENT",
    "H4I_email": null,
    "chapter_id": null,
    "volunteer_type": "BOTH",
    "created_at": "2025-09-27T19:57:51.418Z",
    "updated_at": "2025-09-27T19:57:51.418Z",
    "company_id": null
}
```

**Error Responses**:

- `400 Bad Request`: Validation error
- `404 Not Found`: Volunteer doesn't exist
- `500 Internal Server Error`: Server error

---

### Delete Volunteer

**DELETE** `/volunteers/:id`

**Description**: Delete a volunteer by ID.

**Parameters**:

- `id` (path): Volunteer UUID

**Response**: `204 No Content`

**Error Responses**:

- `404 Not Found`: Volunteer doesn't exist
- `500 Internal Server Error`: Server error

---

## HTTP Status Codes

| Code | Meaning               | Usage                                 |
| ---- | --------------------- | ------------------------------------- |
| 200  | OK                    | Successful GET/PATCH request          |
| 201  | Created               | Successful POST request               |
| 204  | No Content            | Successful DELETE request             |
| 400  | Bad Request           | Validation error or malformed request |
| 404  | Not Found             | Resource doesn't exist                |
| 500  | Internal Server Error | Server or database error              |

---

## Request/Response Examples

### cURL Examples (npm run dev)

**Get all volunteers**:

```bash
curl -X GET http://localhost:3001/api/rest/volunteers
```

**Create a volunteer**:

```bash
curl -X POST http://localhost:3001/api/rest/volunteers \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe1759003071414392@example.com",
    "graduation_date": "2026-06-18T00:00:00.000Z",
    "university_id": "07608837-420f-4697-bda2-701506079a9d",
    "volunteer_status": "STUDENT",
    "volunteer_type": "BOTH"
  }'
```

**Update a volunteers**:

```bash
curl -X PATCH http://localhost:3001/api/rest/volunteers/f2c6386b-60b2-4c5b-a971-a56f5a79dd6a \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Austin Volunteer - Updated"
  }'
```

**Delete a volunteer**:

```bash
curl -X DELETE http://localhost:3001/api/rest/volunteers/f2c6386b-60b2-4c5b-a971-a56f5a79dd6a
```

---

## Validation Rules

### Volunteer Validation

- **first_name**:
  - Required for creation
  - Minimum 2 characters
  - String type
- **last_name**:
  - Required for creation
  - Minimum 2 characters
  - String type
- **email**:
  - Required for creation
  - Valid unique email
- **graduation_date**:
  - Required for creation
  - Must be valid ISO 8601 datetime format
  - Example: `"2024-01-15T00:00:00.000Z"`
- **volunteer_status**:
  - Required (defaults to "STUDENT")
  - Must be either "STUDENT" or "PROFESSIONAL"
- **h4i_email**:
  - Optional for creation
  - Valid unique email
- **volunteer_type**:
  - Required (defaults to "CHAPTER")
  - Must be either "CHAPTER" or "BOTH" or "OPERATIONS
- **university_id**:
  - Required for creation
  - Must be valid UUID format
- **chapter_id**:
  - Optional
  - Must be valid UUID format if provided
- **company_id**:
  - Optional
  - Must be valid UUID format if provided

### Error Response Format

When validation fails, you'll receive a `400 Bad Request` with details:

```json
{
  "error": "Validation error",
  "statusCode": 400,
  "timestamp": "Current Timestamp",
  "requestId": "Request ID",
  "details": [
    {
      "field": "first_name",
      "message": "Invalid input: expected string, received number"
    }
  ],
  "stack": "Additional error information"
}
```
