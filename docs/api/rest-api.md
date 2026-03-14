# REST API Documentation

## Overview

The REST API follows RESTful conventions and provides endpoints for managing volunteer data. All endpoints return JSON responses and use standard HTTP status codes.

**Integrated server** (`pnpm run dev`): `http://localhost:3001/api/rest`
**Standalone server** (`pnpm run dev:rest`): `http://localhost:3002`

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
  }
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

### cURL Examples (pnpm run dev)

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

---

## Chapters Endpoints

### Get All Chapters

**GET** `/chapters`

**Description**: Retrieve all chapters from the database.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `500 Internal Server Error`: Database connection or server error

---

### Get a Chapter by ID

**GET** `/chapters/:id`

**Description**: Retrieve a specific chapter by its ID.

**Parameters**:

- `id` (path): Chapter UUID

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `404 Not Found`: Chapter doesn't exist
- `500 Internal Server Error`: Server error

---

### Create a Chapter

**POST** `/chapters`

**Description**: Create a new chapter.

**Request Body**:

**TODO**: Add example request body.

**Required Fields**:

**TODO**: Add required fields.

**Optional Fields**:

**TODO**: Add optional fields.

**Response**: `201 Created`

**TODO**: Add example response.

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

**TODO**: Add example request body.

**Response**: `200 OK`

**TODO**: Add example response.

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

## Companies Endpoints

### Get All Companies

**GET** `/companies`

**Description**: Retrieve all companies from the database.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `500 Internal Server Error`: Database connection or server error

---

### Get a Company by ID

**GET** `/companies/:id`

**Description**: Retrieve a specific company by its ID.

**Parameters**:

- `id` (path): Company UUID

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `404 Not Found`: Company doesn't exist
- `500 Internal Server Error`: Server error

---

### Create a Company

**POST** `/companies`

**Description**: Create a new company.

**Request Body**:

**TODO**: Add example request body.

**Required Fields**:

**TODO**: Add required fields.

**Optional Fields**:

**TODO**: Add optional fields.

**Response**: `201 Created`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

---

### Update Company

**PATCH** `/companies/:id`

**Description**: Update an existing company. Only provided fields will be updated.

**Parameters**:

- `id` (path): Company UUID

**Request Body** (all fields optional):

**TODO**: Add example request body.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `404 Not Found`: Company doesn't exist
- `500 Internal Server Error`: Server error

---

### Delete Company

**DELETE** `/companies/:id`

**Description**: Delete a company by ID.

**Parameters**:

- `id` (path): Company UUID

**Response**: `204 No Content`

**Error Responses**:

- `404 Not Found`: Company doesn't exist
- `500 Internal Server Error`: Server error

---

## Constituents Endpoints

### Get All Constituents

**GET** `/constituents`

**Description**: Retrieve all constituents from the database.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `500 Internal Server Error`: Database connection or server error

---

### Get a Constituent by ID

**GET** `/constituents/:id`

**Description**: Retrieve a specific constituent by its ID.

**Parameters**:

- `id` (path): Constituent UUID

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `404 Not Found`: Constituent doesn't exist
- `500 Internal Server Error`: Server error

---

### Create a Constituent

**POST** `/constituents`

**Description**: Create a new constituent.

**Request Body**:

**TODO**: Add example request body.

**Required Fields**:

**TODO**: Add required fields.

**Optional Fields**:

**TODO**: Add optional fields.

**Response**: `201 Created`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

---

### Update Constituent

**PATCH** `/constituents/:id`

**Description**: Update an existing constituent. Only provided fields will be updated.

**Parameters**:

- `id` (path): Constituent UUID

**Request Body** (all fields optional):

**TODO**: Add example request body.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `404 Not Found`: Constituent doesn't exist
- `500 Internal Server Error`: Server error

---

### Delete Constituent

**DELETE** `/constituents/:id`

**Description**: Delete a constituent by ID.

**Parameters**:

- `id` (path): Constituent UUID

**Response**: `204 No Content`

**Error Responses**:

- `404 Not Found`: Constituent doesn't exist
- `500 Internal Server Error`: Server error

---

## Locations Endpoints

### Get All Locations

**GET** `/locations`

**Description**: Retrieve all locations from the database.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `500 Internal Server Error`: Database connection or server error

---

### Get a Location by ID

**GET** `/locations/:id`

**Description**: Retrieve a specific location by its ID.

**Parameters**:

- `id` (path): Location UUID

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `404 Not Found`: Location doesn't exist
- `500 Internal Server Error`: Server error

---

### Create a Location

**POST** `/locations`

**Description**: Create a new location.

**Request Body**:

**TODO**: Add example request body.

**Required Fields**:

**TODO**: Add required fields.

**Optional Fields**:

**TODO**: Add optional fields.

**Response**: `201 Created`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

---

### Update Location

**PATCH** `/locations/:id`

**Description**: Update an existing location. Only provided fields will be updated.

**Parameters**:

- `id` (path): Location UUID

**Request Body** (all fields optional):

**TODO**: Add example request body.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `404 Not Found`: Location doesn't exist
- `500 Internal Server Error`: Server error

---

### Delete Location

**DELETE** `/locations/:id`

**Description**: Delete a location by ID.

**Parameters**:

- `id` (path): Location UUID

**Response**: `204 No Content`

**Error Responses**:

- `404 Not Found`: Location doesn't exist
- `500 Internal Server Error`: Server error

---

## Partners Endpoints

### Get All Partners

**GET** `/partners`

**Description**: Retrieve all partners from the database.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `500 Internal Server Error`: Database connection or server error

---

### Get a Partner by ID

**GET** `/partners/:id`

**Description**: Retrieve a specific partner by its ID.

**Parameters**:

- `id` (path): Partner UUID

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `404 Not Found`: Partner doesn't exist
- `500 Internal Server Error`: Server error

---

### Create a Partner

**POST** `/partners`

**Description**: Create a new partner.

**Request Body**:

**TODO**: Add example request body.

**Required Fields**:

**TODO**: Add required fields.

**Optional Fields**:

**TODO**: Add optional fields.

**Response**: `201 Created`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

---

### Update Partner

**PATCH** `/partners/:id`

**Description**: Update an existing partner. Only provided fields will be updated.

**Parameters**:

- `id` (path): Partner UUID

**Request Body** (all fields optional):

**TODO**: Add example request body.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `404 Not Found`: Partner doesn't exist
- `500 Internal Server Error`: Server error

---

### Delete Partner

**DELETE** `/partners/:id`

**Description**: Delete a partner by ID.

**Parameters**:

- `id` (path): Partner UUID

**Response**: `204 No Content`

**Error Responses**:

- `404 Not Found`: Partner doesn't exist
- `500 Internal Server Error`: Server error

---

## Projects Endpoints

### Get All Projects

**GET** `/projects`

**Description**: Retrieve all projects from the database.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `500 Internal Server Error`: Database connection or server error

---

### Get a Project by ID

**GET** `/projects/:id`

**Description**: Retrieve a specific project by its ID.

**Parameters**:

- `id` (path): Project UUID

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `404 Not Found`: Project doesn't exist
- `500 Internal Server Error`: Server error

---

### Create a Project

**POST** `/projects`

**Description**: Create a new project.

**Request Body**:

**TODO**: Add example request body.

**Required Fields**:

**TODO**: Add required fields.

**Optional Fields**:

**TODO**: Add optional fields.

**Response**: `201 Created`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

---

### Update Project

**PATCH** `/projects/:id`

**Description**: Update an existing project. Only provided fields will be updated.

**Parameters**:

- `id` (path): Project UUID

**Request Body** (all fields optional):

**TODO**: Add example request body.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `404 Not Found`: Project doesn't exist
- `500 Internal Server Error`: Server error

---

### Delete Project

**DELETE** `/projects/:id`

**Description**: Delete a project by ID.

**Parameters**:

- `id` (path): Project UUID

**Response**: `204 No Content`

**Error Responses**:

- `404 Not Found`: Project doesn't exist
- `500 Internal Server Error`: Server error

---

## Officer Roles Endpoints

### Get All Officer Roles

**GET** `/officer-roles`

**Description**: Retrieve all officer roles from the database.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `500 Internal Server Error`: Database connection or server error

---

### Get an Officer Role by ID

**GET** `/officer-roles/:id`

**Description**: Retrieve a specific officer role by its ID.

**Parameters**:

- `id` (path): Officer Role UUID

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `404 Not Found`: Officer Role doesn't exist
- `500 Internal Server Error`: Server error

---

### Create an Officer Role

**POST** `/officer-roles`

**Description**: Create a new officer role.

**Request Body**:

**TODO**: Add example request body.

**Required Fields**:

**TODO**: Add required fields.

**Optional Fields**:

**TODO**: Add optional fields.

**Response**: `201 Created`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

---

### Update Officer Role

**PATCH** `/officer-roles/:id`

**Description**: Update an existing officer role. Only provided fields will be updated.

**Parameters**:

- `id` (path): Officer Role UUID

**Request Body** (all fields optional):

**TODO**: Add example request body.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `404 Not Found`: Officer Role doesn't exist
- `500 Internal Server Error`: Server error

---

### Delete Officer Role

**DELETE** `/officer-roles/:id`

**Description**: Delete an officer role by ID.

**Parameters**:

- `id` (path): Officer Role UUID

**Response**: `204 No Content`

**Error Responses**:

- `404 Not Found`: Officer Role doesn't exist
- `500 Internal Server Error`: Server error

---

## Mentors Endpoints

### Get All Mentors

**GET** `/mentors`

**Description**: Retrieve all mentors from the database.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `500 Internal Server Error`: Database connection or server error

---

### Get a Mentor by ID

**GET** `/mentors/:id`

**Description**: Retrieve a specific mentor by its ID.

**Parameters**:

- `id` (path): Mentor UUID

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `404 Not Found`: Mentor doesn't exist
- `500 Internal Server Error`: Server error

---

### Create a Mentor

**POST** `/mentors`

**Description**: Create a new mentor.

**Request Body**:

**TODO**: Add example request body.

**Required Fields**:

**TODO**: Add required fields.

**Optional Fields**:

**TODO**: Add optional fields.

**Response**: `201 Created`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

---

### Update Mentor

**PATCH** `/mentors/:id`

**Description**: Update an existing mentor. Only provided fields will be updated.

**Parameters**:

- `id` (path): Mentor UUID

**Request Body** (all fields optional):

**TODO**: Add example request body.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `404 Not Found`: Mentor doesn't exist
- `500 Internal Server Error`: Server error

---

### Delete Mentor

**DELETE** `/mentors/:id`

**Description**: Delete a mentor by ID.

**Parameters**:

- `id` (path): Mentor UUID

**Response**: `204 No Content`

**Error Responses**:

- `404 Not Found`: Mentor doesn't exist
- `500 Internal Server Error`: Server error

---

## Universities Endpoints

### Get All Universities

**GET** `/universities`

**Description**: Retrieve all universities from the database.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `500 Internal Server Error`: Database connection or server error

---

### Get a University by ID

**GET** `/universities/:id`

**Description**: Retrieve a specific university by its ID.

**Parameters**:

- `id` (path): University UUID

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `404 Not Found`: University doesn't exist
- `500 Internal Server Error`: Server error

---

### Create a University

**POST** `/universities`

**Description**: Create a new university.

**Request Body**:

**TODO**: Add example request body.

**Required Fields**:

**TODO**: Add required fields.

**Optional Fields**:

**TODO**: Add optional fields.

**Response**: `201 Created`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

---

### Update University

**PATCH** `/universities/:id`

**Description**: Update an existing university. Only provided fields will be updated.

**Parameters**:

- `id` (path): University UUID

**Request Body** (all fields optional):

**TODO**: Add example request body.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `404 Not Found`: University doesn't exist
- `500 Internal Server Error`: Server error

---

### Delete University

**DELETE** `/universities/:id`

**Description**: Delete a university by ID.

**Parameters**:

- `id` (path): University UUID

**Response**: `204 No Content`

**Error Responses**:

- `404 Not Found`: University doesn't exist
- `500 Internal Server Error`: Server error

---

## Academic Terms Endpoints

### Get All Academic Terms

**GET** `/academic-terms`

**Description**: Retrieve all academic terms from the database.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `500 Internal Server Error`: Database connection or server error

---

### Get an Academic Term by ID

**GET** `/academic-terms/:id`

**Description**: Retrieve a specific academic term by its ID.

**Parameters**:

- `id` (path): Academic Term UUID

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `404 Not Found`: Academic Term doesn't exist
- `500 Internal Server Error`: Server error

---

### Create an Academic Term

**POST** `/academic-terms`

**Description**: Create a new academic term.

**Request Body**:

**TODO**: Add example request body.

**Required Fields**:

**TODO**: Add required fields.

**Optional Fields**:

**TODO**: Add optional fields.

**Response**: `201 Created`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

---

### Update Academic Term

**PATCH** `/academic-terms/:id`

**Description**: Update an existing academic term. Only provided fields will be updated.

**Parameters**:

- `id` (path): Academic Term UUID

**Request Body** (all fields optional):

**TODO**: Add example request body.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `404 Not Found`: Academic Term doesn't exist
- `500 Internal Server Error`: Server error

---

### Delete Academic Term

**DELETE** `/academic-terms/:id`

**Description**: Delete an academic term by ID.

**Parameters**:

- `id` (path): Academic Term UUID

**Response**: `204 No Content`

**Error Responses**:

- `404 Not Found`: Academic Term doesn't exist
- `500 Internal Server Error`: Server error

---

## Project Roles Endpoints

### Get All Project Roles

**GET** `/project-roles`

**Description**: Retrieve all project roles from the database.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `500 Internal Server Error`: Database connection or server error

---

### Get a Project Role by ID

**GET** `/project-roles/:id`

**Description**: Retrieve a specific project role by its ID.

**Parameters**:

- `id` (path): Project Role UUID

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `404 Not Found`: Project Role doesn't exist
- `500 Internal Server Error`: Server error

---

### Create a Project Role

**POST** `/project-roles`

**Description**: Create a new project role.

**Request Body**:

**TODO**: Add example request body.

**Required Fields**:

**TODO**: Add required fields.

**Optional Fields**:

**TODO**: Add optional fields.

**Response**: `201 Created`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

---

### Update Project Role

**PATCH** `/project-roles/:id`

**Description**: Update an existing project role. Only provided fields will be updated.

**Parameters**:

- `id` (path): Project Role UUID

**Request Body** (all fields optional):

**TODO**: Add example request body.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `404 Not Found`: Project Role doesn't exist
- `500 Internal Server Error`: Server error

---

### Delete Project Role

**DELETE** `/project-roles/:id`

**Description**: Delete a project role by ID.

**Parameters**:

- `id` (path): Project Role UUID

**Response**: `204 No Content`

**Error Responses**:

- `404 Not Found`: Project Role doesn't exist
- `500 Internal Server Error`: Server error

---

## Social Links Endpoints

### Get All Social Links

**GET** `/social-links`

**Description**: Retrieve all social links from the database.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `500 Internal Server Error`: Database connection or server error

---

### Get a Social Link by ID

**GET** `/social-links/:id`

**Description**: Retrieve a specific social link by its ID.

**Parameters**:

- `id` (path): Social Link UUID

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `404 Not Found`: Social Link doesn't exist
- `500 Internal Server Error`: Server error

---

### Create a Social Link

**POST** `/social-links`

**Description**: Create a new social link.

**Request Body**:

**TODO**: Add example request body.

**Required Fields**:

**TODO**: Add required fields.

**Optional Fields**:

**TODO**: Add optional fields.

**Response**: `201 Created`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

---

### Update Social Link

**PATCH** `/social-links/:id`

**Description**: Update an existing social link. Only provided fields will be updated.

**Parameters**:

- `id` (path): Social Link UUID

**Request Body** (all fields optional):

**TODO**: Add example request body.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `404 Not Found`: Social Link doesn't exist
- `500 Internal Server Error`: Server error

---

### Delete Social Link

**DELETE** `/social-links/:id`

**Description**: Delete a social link by ID.

**Parameters**:

- `id` (path): Social Link UUID

**Response**: `204 No Content`

**Error Responses**:

- `404 Not Found`: Social Link doesn't exist
- `500 Internal Server Error`: Server error

---

## Volunteer History Endpoints

### Get All Volunteer History

**GET** `/volunteer-history`

**Description**: Retrieve all volunteer history from the database.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `500 Internal Server Error`: Database connection or server error

---

### Get a Volunteer History by ID

**GET** `/volunteer-history/:id`

**Description**: Retrieve a specific volunteer history by its ID.

**Parameters**:

- `id` (path): Volunteer History UUID

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `404 Not Found`: Volunteer History doesn't exist
- `500 Internal Server Error`: Server error

---

### Create a Volunteer History

**POST** `/volunteer-history`

**Description**: Create a new volunteer history.

**Request Body**:

**TODO**: Add example request body.

**Required Fields**:

**TODO**: Add required fields.

**Optional Fields**:

**TODO**: Add optional fields.

**Response**: `201 Created`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

---

### Update Volunteer History

**PATCH** `/volunteer-history/:id`

**Description**: Update an existing volunteer history. Only provided fields will be updated.

**Parameters**:

- `id` (path): Volunteer History UUID

**Request Body** (all fields optional):

**TODO**: Add example request body.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `404 Not Found`: Volunteer History doesn't exist
- `500 Internal Server Error`: Server error

---

### Delete Volunteer History

**DELETE** `/volunteer-history/:id`

**Description**: Delete a volunteer history by ID.

**Parameters**:

- `id` (path): Volunteer History UUID

**Response**: `204 No Content`

**Error Responses**:

- `404 Not Found`: Volunteer History doesn't exist
- `500 Internal Server Error`: Server error

---

## Officer Assignments Endpoints

### Get All Officer Assignments

**GET** `/officer-assignments`

**Description**: Retrieve all officer assignments from the database.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `500 Internal Server Error`: Database connection or server error

---

### Get an Officer Assignment by ID

**GET** `/officer-assignments/:id`

**Description**: Retrieve a specific officer assignment by its ID.

**Parameters**:

- `id` (path): Officer Assignment UUID

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `404 Not Found`: Officer Assignment doesn't exist
- `500 Internal Server Error`: Server error

---

### Create an Officer Assignment

**POST** `/officer-assignments`

**Description**: Create a new officer assignment.

**Request Body**:

**TODO**: Add example request body.

**Required Fields**:

**TODO**: Add required fields.

**Optional Fields**:

**TODO**: Add optional fields.

**Response**: `201 Created`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

---

### Update Officer Assignment

**PATCH** `/officer-assignments/:id`

**Description**: Update an existing officer assignment. Only provided fields will be updated.

**Parameters**:

- `id` (path): Officer Assignment UUID

**Request Body** (all fields optional):

**TODO**: Add example request body.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `404 Not Found`: Officer Assignment doesn't exist
- `500 Internal Server Error`: Server error

---

### Delete Officer Assignment

**DELETE** `/officer-assignments/:id`

**Description**: Delete an officer assignment by ID.

**Parameters**:

- `id` (path): Officer Assignment UUID

**Response**: `204 No Content`

**Error Responses**:

- `404 Not Found`: Officer Assignment doesn't exist
- `500 Internal Server Error`: Server error

---

## Mentorships Endpoints

### Get All Mentorships

**GET** `/mentorships`

**Description**: Retrieve all mentorships from the database.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `500 Internal Server Error`: Database connection or server error

---

### Get a Mentorship by ID

**GET** `/mentorships/:id`

**Description**: Retrieve a specific mentorship by its ID.

**Parameters**:

- `id` (path): Mentorship UUID

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `404 Not Found`: Mentorship doesn't exist
- `500 Internal Server Error`: Server error

---

### Create a Mentorship

**POST** `/mentorships`

**Description**: Create a new mentorship.

**Request Body**:

**TODO**: Add example request body.

**Required Fields**:

**TODO**: Add required fields.

**Optional Fields**:

**TODO**: Add optional fields.

**Response**: `201 Created`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

---

### Update Mentorship

**PATCH** `/mentorships/:id`

**Description**: Update an existing mentorship. Only provided fields will be updated.

**Parameters**:

- `id` (path): Mentorship UUID

**Request Body** (all fields optional):

**TODO**: Add example request body.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `404 Not Found`: Mentorship doesn't exist
- `500 Internal Server Error`: Server error

---

### Delete Mentorship

**DELETE** `/mentorships/:id`

**Description**: Delete a mentorship by ID.

**Parameters**:

- `id` (path): Mentorship UUID

**Response**: `204 No Content`

**Error Responses**:

- `404 Not Found`: Mentorship doesn't exist
- `500 Internal Server Error`: Server error

---

## Project Deliverables Endpoints

### Get All Project Deliverables

**GET** `/project-deliverables`

**Description**: Retrieve all project deliverables from the database.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `500 Internal Server Error`: Database connection or server error

---

### Get a Project Deliverable by ID

**GET** `/project-deliverables/:id`

**Description**: Retrieve a specific project deliverable by its ID.

**Parameters**:

- `id` (path): Project Deliverable UUID

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `404 Not Found`: Project Deliverable doesn't exist
- `500 Internal Server Error`: Server error

---

### Create a Project Deliverable

**POST** `/project-deliverables`

**Description**: Create a new project deliverable.

**Request Body**:

**TODO**: Add example request body.

**Required Fields**:

**TODO**: Add required fields.

**Optional Fields**:

**TODO**: Add optional fields.

**Response**: `201 Created`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

---

### Update Project Deliverable

**PATCH** `/project-deliverables/:id`

**Description**: Update an existing project deliverable. Only provided fields will be updated.

**Parameters**:

- `id` (path): Project Deliverable UUID

**Request Body** (all fields optional):

**TODO**: Add example request body.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `404 Not Found`: Project Deliverable doesn't exist
- `500 Internal Server Error`: Server error

---

### Delete Project Deliverable

**DELETE** `/project-deliverables/:id`

**Description**: Delete a project deliverable by ID.

**Parameters**:

- `id` (path): Project Deliverable UUID

**Response**: `204 No Content`

**Error Responses**:

- `404 Not Found`: Project Deliverable doesn't exist
- `500 Internal Server Error`: Server error

---

## Project Engagements Endpoints

### Get All Project Engagements

**GET** `/project-engagements`

**Description**: Retrieve all project engagements from the database.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `500 Internal Server Error`: Database connection or server error

---

### Get a Project Engagement by ID

**GET** `/project-engagements/:id`

**Description**: Retrieve a specific project engagement by its ID.

**Parameters**:

- `id` (path): Project Engagement UUID

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `404 Not Found`: Project Engagement doesn't exist
- `500 Internal Server Error`: Server error

---

### Create a Project Engagement

**POST** `/project-engagements`

**Description**: Create a new project engagement.

**Request Body**:

**TODO**: Add example request body.

**Required Fields**:

**TODO**: Add required fields.

**Optional Fields**:

**TODO**: Add optional fields.

**Response**: `201 Created`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

---

### Update Project Engagement

**PATCH** `/project-engagements/:id`

**Description**: Update an existing project engagement. Only provided fields will be updated.

**Parameters**:

- `id` (path): Project Engagement UUID

**Request Body** (all fields optional):

**TODO**: Add example request body.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `404 Not Found`: Project Engagement doesn't exist
- `500 Internal Server Error`: Server error

---

### Delete Project Engagement

**DELETE** `/project-engagements/:id`

**Description**: Delete a project engagement by ID.

**Parameters**:

- `id` (path): Project Engagement UUID

**Response**: `204 No Content`

**Error Responses**:

- `404 Not Found`: Project Engagement doesn't exist
- `500 Internal Server Error`: Server error

---

## Project Staffing Endpoints

### Get All Project Staffing

**GET** `/project-staffing`

**Description**: Retrieve all project staffing from the database.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `500 Internal Server Error`: Database connection or server error

---

### Get a Project Staffing by ID

**GET** `/project-staffing/:id`

**Description**: Retrieve a specific project staffing by its ID.

**Parameters**:

- `id` (path): Project Staffing UUID

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `404 Not Found`: Project Staffing doesn't exist
- `500 Internal Server Error`: Server error

---

### Create a Project Staffing

**POST** `/project-staffing`

**Description**: Create a new project staffing.

**Request Body**:

**TODO**: Add example request body.

**Required Fields**:

**TODO**: Add required fields.

**Optional Fields**:

**TODO**: Add optional fields.

**Response**: `201 Created`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

---

### Update Project Staffing

**PATCH** `/project-staffing/:id`

**Description**: Update an existing project staffing. Only provided fields will be updated.

**Parameters**:

- `id` (path): Project Staffing UUID

**Request Body** (all fields optional):

**TODO**: Add example request body.

**Response**: `200 OK`

**TODO**: Add example response.

**Error Responses**:

- `400 Bad Request`: Validation error
- `404 Not Found`: Project Staffing doesn't exist
- `500 Internal Server Error`: Server error

---

### Delete Project Staffing

**DELETE** `/project-staffing/:id`

**Description**: Delete a project staffing by ID.

**Parameters**:

- `id` (path): Project Staffing UUID

**Response**: `204 No Content`

**Error Responses**:

- `404 Not Found`: Project Staffing doesn't exist
- `500 Internal Server Error`: Server error
