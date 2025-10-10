# GraphQL Development Examples & TDD Flow

This guide demonstrates how to create GraphQL endpoints using Test-Driven Development (TDD) in this project.

---

## TDD Flow Overview

### 1. Red → Green → Refactor Cycle

1. **Red**: Write a failing test first
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Improve code while keeping tests passing

### 2. Test Pyramid in This Project

- **Integration Tests**: `tests/integration/graphql/` - Test GraphQL endpoints end-to-end
- **Unit Tests**: `tests/unit/services/` - Test business logic in isolation
- **Validation**: Zod schemas ensure type safety at runtime

---

## Example: Adding a New GraphQL Endpoint

Let's walk through adding a `volunteer` entity using TDD!

### Step 1: Write the Failing Integration Test (RED)

**File**: `tests/integration/graphql/volunteer.test.ts`

```typescript
import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { env } from '../../../src/config/server';

let server: Server;
let app: express.Application;

beforeAll(() => {
  app = createGraphqlApp();
  server = app.listen(env.GRAPHQL_PORT);
});

afterAll(() => {
  server.close();
});

describe('GraphQL API - Volunteers', () => {
  it('should create a new volunteer via mutation', async () => {
    const mutation = `
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
          h4i_email
          chapter_id
          company_id
        }
      }
    `;
    const variables = {
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
    };

    const response = await request(server)
      .post('/') // GraphQL server is at the root
      .send({ query: mutation, variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const volunteer = response.body.data.createVolunteer;
    expect(volunteer).toHaveProperty('volunteer_id');
    expect(volunteer.first_name).toBe('John');
  });

  it('should create and fetch a volunteer by their ID via query', async () => {
    // Create a volunteer for this specific test
    const createMutation = `
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
    `;
    const createVariables = {
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
    };

    const createResponse = await request(server)
      .post('/')
      .send({ query: createMutation, variables: createVariables });

    expect(createResponse.status).toBe(200);
    expect(createResponse.body.errors).toBeUndefined();
    const volunteerId = createResponse.body.data.createVolunteer.volunteer_id;

    // Now fetch it
    const query = `
      query Volunteer($id: ID!) {
        volunteer(id: $id) {
          volunteer_id
          first_name
        }
      }
    `;
    const variables = { id: volunteerId };

    const response = await request(server).post('/').send({ query, variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const volunteer = response.body.data.volunteer;
    expect(volunteer.volunteer_id).toBe(volunteerId);
    expect(volunteer.first_name).toBe('John');
  });
});
```

**Run the test** (it will fail):

```bash
npm run test:integration
```

### Step 2: Write Unit Tests for Service Layer (RED)

**File**: `tests/unit/services/volunteer.service.test.ts`

```typescript
import {
  getAllVolunteers,
  getVolunteerById,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';
import { volunteer_status, volunteer_type } from '@prisma/client';

// Mock the entire prisma module
jest.mock('../../../src/config/database', () => ({
  prisma: {
    volunteers: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Volunteer Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllVolunteers', () => {
    it('should return an array of volunteers', async () => {
      const mockVolunteers = [
        {
          volunteer_id: '1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          graduation_date: new Date(),
          volunteer_status: 'STUDENT',
          volunteer_type: 'BOTH',
          university_id: 'uuid-123',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.volunteers.findMany as jest.Mock).mockResolvedValue(
        mockVolunteers
      );

      const result = await getAllVolunteers();

      expect(result).toEqual(mockVolunteers);
      expect(prisma.volunteers.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getVolunteerById', () => {
    it('should return a single volunteer when a valid ID is provided', async () => {
      const volunteerId = '1';
      const mockVolunteer = {
        volunteer_id: volunteerId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        graduation_date: new Date(),
        volunteer_status: 'STUDENT',
        volunteer_type: 'BOTH',
        university_id: 'uuid-123',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.volunteers.findUnique as jest.Mock).mockResolvedValue(
        mockVolunteer
      );

      const result = await getVolunteerById(volunteerId);

      expect(result).toEqual(mockVolunteer);
      expect(prisma.volunteers.findUnique).toHaveBeenCalledWith({
        where: { volunteer_id: volunteerId },
      });
    });

    it('should throw NotFoundError if no volunteer is found', async () => {
      const volunteerId = 'non-existent-id';
      (prisma.volunteers.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getVolunteerById(volunteerId)).rejects.toThrow(
        "Volunteer with id 'non-existent-id' not found"
      );
    });
  });

  describe('createVolunteer', () => {
    it('should create and return a new volunteer', async () => {
      const inputData = {
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane.doe@example.com',
        graduation_date: new Date('2026-06-18').toISOString(),
        volunteer_status: 'STUDENT' as volunteer_status,
        volunteer_type: 'BOTH' as volunteer_type,
        university_id: 'uuid-123',
      };
      const createdVolunteer = {
        volunteer_id: 'new-id-123',
        ...inputData,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.volunteers.create as jest.Mock).mockResolvedValue(
        createdVolunteer
      );

      const result = await createVolunteer(inputData);

      expect(result).toEqual(createdVolunteer);
      expect(prisma.volunteers.create).toHaveBeenCalledWith({
        data: inputData,
      });
    });
  });

  describe('updateVolunteer', () => {
    it('should update and return the volunteer', async () => {
      const volunteerId = '1';
      const updateData = { first_name: 'Updated Name' };
      const updatedVolunteer = {
        volunteer_id: volunteerId,
        first_name: 'Updated Name',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        graduation_date: new Date(),
        volunteer_status: 'STUDENT',
        volunteer_type: 'BOTH',
        university_id: 'uuid-123',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.volunteers.update as jest.Mock).mockResolvedValue(
        updatedVolunteer
      );

      const result = await updateVolunteer(volunteerId, updateData);

      expect(result).toEqual(updatedVolunteer);
      expect(prisma.volunteers.update).toHaveBeenCalledWith({
        where: { volunteer_id: volunteerId },
        data: updateData,
      });
    });
  });

  describe('deleteVolunteer', () => {
    it('should call delete with the correct ID and return the deleted volunteer', async () => {
      const volunteerId = '1';
      const deletedVolunteer = {
        volunteer_id: volunteerId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        graduation_date: new Date(),
        volunteer_status: 'STUDENT',
        volunteer_type: 'BOTH',
        university_id: 'uuid-123',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.volunteers.delete as jest.Mock).mockResolvedValue(
        deletedVolunteer
      );

      const result = await deleteVolunteer(volunteerId);

      expect(result).toEqual(deletedVolunteer);
      expect(prisma.volunteers.delete).toHaveBeenCalledWith({
        where: { volunteer_id: volunteerId },
      });
    });
  });
});
```

### Step 3: Create Validator (GREEN)

**File**: `src/core/validators/volunteer.validator.ts`

```typescript
import { z } from 'zod';

export const createVolunteerSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.email('Must be a valid email address'),
  graduation_date: z.iso.datetime(),
  volunteer_status: z.enum(['STUDENT', 'PROFESSIONAL']),
  h4i_email: z.email('Must be a valid H4I email address').optional(),
  volunteer_type: z.enum(['CHAPTER', 'BOTH', 'OPERATIONS']),
  university_id: z.uuid(),
  chapter_id: z.uuid().optional(),
  company_id: z.uuid().optional(),
});

export const updateVolunteerSchema = createVolunteerSchema.partial();
```

### Step 4: Create Service Layer (GREEN)

**File**: `src/core/services/volunteer.service.ts`

```typescript
import { prisma } from '../../config/database';
import { createVolunteerSchema, updateVolunteerSchema } from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

// Define types based on Zod schemas for better type safety
type CreateVolunteerInput = z.infer<typeof createVolunteerSchema>;
type UpdateVolunteerInput = z.infer<typeof updateVolunteerSchema>;

export async function getAllVolunteers() {
  try {
    logger.info('Fetching all volunteers');
    const volunteers = await prisma.volunteers.findMany({
      orderBy: { created_at: 'desc' },
    });

    logger.info('Successfully retrieved volunteers', {
      count: volunteers.length,
    });

    return volunteers;
  } catch (error) {
    logger.error('Failed to fetch volunteers', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve volunteers');
  }
}

export async function getVolunteerById(id: string) {
  try {
    logger.info('Fetching volunteer by ID', { volunteerId: id });

    const volunteer = await prisma.volunteers.findUnique({
      where: { volunteer_id: id },
    });

    if (!volunteer) {
      logger.warn('Volunteer not found', { volunteerId: id });
      throw new NotFoundError('Volunteer', id);
    }

    logger.info('Successfully retrieved volunteer', {
      volunteerId: id,
      volunteerName: volunteer.first_name + ' ' + volunteer.last_name,
    });

    return volunteer;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Failed to fetch volunteer by ID', {
      volunteerId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve volunteer');
  }
}

export async function createVolunteer(data: CreateVolunteerInput) {
  try {
    logger.info('Creating new volunteer', {
      volunteerName: data.first_name + ' ' + data.last_name,
      volunteerData: data,
    });

    const volunteer = await prisma.volunteers.create({ data });

    logger.info('Successfully created volunteer', {
      volunteerId: volunteer.volunteer_id,
      volunteerName: volunteer.first_name + ' ' + volunteer.last_name,
    });

    return volunteer;
  } catch (error) {
    logger.error('Failed to create volunteer', {
      volunteerData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create volunteer');
  }
}

export async function updateVolunteer(id: string, data: UpdateVolunteerInput) {
  try {
    logger.info('Updating volunteer', {
      volunteerId: id,
      updateData: data,
    });

    const volunteer = await prisma.volunteers.update({
      where: { volunteer_id: id },
      data,
    });

    logger.info('Successfully updated volunteer', {
      volunteerId: id,
      volunteerName: volunteer.first_name + ' ' + volunteer.last_name,
    });

    return volunteer;
  } catch (error) {
    logger.error('Failed to update volunteer', {
      volunteerId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Check if volunteer doesn't exist
    if (
      error instanceof Error &&
      error.message.includes('Record to update not found')
    ) {
      throw new NotFoundError('Volunteer', id);
    }

    throw new DatabaseError('Failed to update volunteer');
  }
}

export async function deleteVolunteer(id: string) {
  try {
    logger.info('Deleting volunteer', { volunteerId: id });

    const volunteer = await prisma.volunteers.delete({
      where: { volunteer_id: id },
    });

    logger.info('Successfully deleted volunteer', {
      volunteerId: id,
      volunteerName: volunteer.first_name + ' ' + volunteer.last_name,
    });

    return volunteer;
  } catch (error) {
    logger.error('Failed to delete volunteer', {
      volunteerId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Check if volunteer doesn't exist
    if (
      error instanceof Error &&
      error.message.includes('Record to delete does not exist')
    ) {
      throw new NotFoundError('Volunteer', id);
    }

    throw new DatabaseError('Failed to delete volunteer');
  }
}
```

### Step 5: Create GraphQL Schema (GREEN)

**File**: `src/api/graphql/schemas/volunteer.schema.ts`

```typescript
export const volunteerSchemaString = `
  # Using the enum from your Prisma schema
  enum StatusType {
    STUDENT
    PROFESSIONAL
  }

  enum VolunteerType {
    OPERATIONS
    CHAPTER
    BOTH
  }

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

`;
```

### Step 6: Create GraphQL Resolvers (GREEN)

**File**: `src/api/graphql/resolvers/volunteer.resolvers.ts`

```typescript
import {
  createVolunteer,
  createVolunteerSchema,
  deleteVolunteer,
  getAllVolunteers,
  getVolunteerById,
  updateVolunteer,
  updateVolunteerSchema,
} from '../../../core';
import { GraphQLError } from 'graphql';
import { z } from 'zod';

// Infer TypeScript types directly from your Zod schemas
type CreateVolunteerInput = z.infer<typeof createVolunteerSchema>;
type UpdateVolunteerInput = z.infer<typeof updateVolunteerSchema>;

export const volunteerResolvers = {
  Query: {
    volunteers: () => getAllVolunteers(),
    volunteer: async (_parent: unknown, { id }: { id: string }) => {
      const volunteer = await getVolunteerById(id);
      if (!volunteer) {
        throw new GraphQLError(
          'Volunteer not found',
          undefined, // nodes
          undefined, // source
          undefined, // positions
          undefined, // path
          undefined, // originalError
          { code: 'NOT_FOUND' } // extensions
        );
      }
      return volunteer;
    },
  },
  Mutation: {
    createVolunteer: (
      _parent: unknown,
      { input }: { input: CreateVolunteerInput }
    ) => {
      const validatedInput = createVolunteerSchema.parse(input);
      return createVolunteer(validatedInput);
    },
    updateVolunteer: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateVolunteerInput }
    ) => {
      const validatedInput = updateVolunteerSchema.parse(input);
      return updateVolunteer(id, validatedInput);
    },
    deleteVolunteer: (_parent: unknown, { id }: { id: string }) => {
      return deleteVolunteer(id);
    },
  },
};
```

### Step 7: Wire Everything Together (GREEN)

Update the index files to export your new components:

**File**: `src/core/validators/index.ts`

```typescript
export * from './volunteer.validator'; // Add this line
```

**File**: `src/core/services/index.ts`

```typescript
export * from './volunteer.service'; // Add this line
```

**File**: `src/api/graphql/schemas/index.ts`

```typescript
import { chapterSchemaString } from './chapter.schema';
import { volunteerSchemaString } from './volunteer.schema'; // Add this

export const typeDefs = [
  chapterSchemaString,
  volunteerSchemaString, // Add this
];
```

**File**: `src/api/graphql/resolvers/index.ts`

```typescript
import { chapterResolvers } from './chapter.resolvers';
import { volunteerResolvers } from './volunteer.resolvers'; // Add this

export const resolvers = {
  Query: {
    ...chapterResolvers.Query,
    ...volunteerResolvers.Query, // Add this
  },
  Mutation: {
    ...chapterResolvers.Mutation,
    ...volunteerResolvers.Mutation, // Add this
  },
};
```

### Step 8: Run Tests (GREEN)

```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run all tests
npm test
```

### Step 9: Refactor (REFACTOR)

Now that tests pass, consider refactoring:

1. **Extract common test setup** into helper functions
2. **Add error handling** middleware for consistent error responses
3. **Optimize database queries** with proper indexes
4. **Add pagination** for list endpoints
5. **Add input sanitization** for security

---

## GraphQL Query Examples

### Basic Queries

```graphql
# Get all volunteers
query {
  volunteers {
    volunteer_id
    first_name
    last_name
    email
    volunteer_status
  }
}

# Get single volunteer with variables
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

### Mutations with Variables

```graphql
# Create volunteer
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

# Variables:
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

### Error Handling Examples

```graphql
# This will return an error if volunteer doesn't exist
query {
  volunteer(id: "non-existent-id") {
    volunteer_id
    first_name
  }
}

# Response:
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

---

## Best Practices

### 1. Test Organization

- **Unit tests** for business logic (services)
- **Integration tests** for GraphQL endpoints
- **Mock external dependencies** in unit tests
- **Use real database** in integration tests

### 2. Error Handling

- Use `GraphQLError` for consistent error responses
- Add error codes in extensions for client handling
- Validate input with Zod schemas

### 3. Type Safety

- Define TypeScript types from Zod schemas
- Use `z.infer<typeof schema>` for type inference
- Validate all inputs at resolver level

### 4. Database Best Practices

- Use transactions for multi-table operations
- Clean up test data in `afterAll`/`afterEach`
- Use connection pooling for better performance
