# GraphQL Development Examples & TDD Flow

This guide demonstrates how to create GraphQL endpoints using Test-Driven Development (TDD) in this project.

---

## TDD Flow Overview

### 1. Red → Green → Refactor Cycle
1. **Red**: Write a failing test first
2. **Green**: Write minimal code to make the test pass  
3. **Refactor**: Improve code while keeping tests passing

### 2. Test Pyramid in This Project
- **Unit Tests**: `tests/unit/services/` - Test business logic in isolation
- **Integration Tests**: `tests/integration/graphql/` - Test GraphQL endpoints end-to-end
- **Validation**: Zod schemas ensure type safety at runtime

---

## Example: Adding a New GraphQL Endpoint

Let's walk through adding a `volunteer` entity using TDD.

### Step 1: Write the Failing Integration Test (RED)

**File**: `tests/integration/graphql/volunteer.test.ts`

```typescript
import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { disconnectDB, prisma } from '../../../src/config/database';
import { env } from '../../../src/config/server';

let server: Server;
let app: express.Application;
let createdVolunteerId: string;

beforeAll(() => {
  app = createGraphqlApp();
  server = app.listen(env.GRAPHQL_PORT);
});

afterAll(async () => {
  if (createdVolunteerId) {
    await prisma.volunteers.delete({ where: { volunteer_id: createdVolunteerId } });
  }
  server.close();
  await disconnectDB();
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
          volunteer_status
        }
      }
    `;
    
    const variables = {
      input: {
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane.doe@example.com',
        volunteer_status: 'STUDENT'
      },
    };

    const response = await request(server)
      .post('/')
      .send({ query: mutation, variables });

    // Test will fail initially - that's the RED phase
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const volunteer = response.body.data.createVolunteer;
    expect(volunteer).toHaveProperty('volunteer_id');
    expect(volunteer.first_name).toBe('Jane');
    expect(volunteer.email).toBe('jane.doe@example.com');

    createdVolunteerId = volunteer.volunteer_id;
  });

  it('should fetch volunteers via query', async () => {
    const query = `
      query {
        volunteers {
          volunteer_id
          first_name
          last_name
          email
        }
      }
    `;

    const response = await request(server)
      .post('/')
      .send({ query });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.volunteers)).toBe(true);
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
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    volunteers: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Volunteer Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createVolunteer', () => {
    it('should create and return a new volunteer', async () => {
      const inputData = {
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane.doe@example.com',
        volunteer_status: 'STUDENT' as const,
      };
      
      const createdVolunteer = {
        volunteer_id: 'new-id-123',
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane.doe@example.com',
        volunteer_status: 'STUDENT',
        created_at: new Date(),
        updated_at: new Date(),
      };
      
      (prisma.volunteers.create as jest.Mock).mockResolvedValue(createdVolunteer);

      const result = await createVolunteer(inputData);

      expect(result).toEqual(createdVolunteer);
      expect(prisma.volunteers.create).toHaveBeenCalledWith({ data: inputData });
    });
  });

  describe('getAllVolunteers', () => {
    it('should return an array of volunteers', async () => {
      const mockVolunteers = [
        {
          volunteer_id: '1',
          first_name: 'John',
          last_name: 'Smith',
          email: 'john@example.com',
          volunteer_status: 'STUDENT',
        },
      ];
      
      (prisma.volunteers.findMany as jest.Mock).mockResolvedValue(mockVolunteers);

      const result = await getAllVolunteers();

      expect(result).toEqual(mockVolunteers);
      expect(prisma.volunteers.findMany).toHaveBeenCalledTimes(1);
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
  email: z.string().email('Must be a valid email address'),
  volunteer_status: z.enum(['STUDENT', 'PROFESSIONAL']),
  phone: z.string().optional(),
  university_id: z.uuid().optional(),
});

export const updateVolunteerSchema = createVolunteerSchema.partial();
```

### Step 4: Create Service Layer (GREEN)

**File**: `src/core/services/volunteer.service.ts`

```typescript
import { prisma } from '../../config/database';
import { createVolunteerSchema, updateVolunteerSchema } from '../validators';
import { z } from 'zod';

type CreateVolunteerInput = z.infer<typeof createVolunteerSchema>;
type UpdateVolunteerInput = z.infer<typeof updateVolunteerSchema>;

export const getAllVolunteers = () => {
  return prisma.volunteers.findMany();
};

export const getVolunteerById = (id: string) => {
  return prisma.volunteers.findUnique({ where: { volunteer_id: id } });
};

export const createVolunteer = (data: CreateVolunteerInput) => {
  return prisma.volunteers.create({ data });
};

export const updateVolunteer = (id: string, data: UpdateVolunteerInput) => {
  return prisma.volunteers.update({ where: { volunteer_id: id }, data });
};

export const deleteVolunteer = (id: string) => {
  return prisma.volunteers.delete({ where: { volunteer_id: id } });
};
```

### Step 5: Create GraphQL Schema (GREEN)

**File**: `src/api/graphql/schemas/volunteer.schema.ts`

```typescript
export const volunteerSchemaString = `
  enum VolunteerStatus {
    STUDENT
    PROFESSIONAL
  }

  type Volunteer {
    volunteer_id: ID!
    first_name: String!
    last_name: String!
    email: String!
    volunteer_status: VolunteerStatus!
    phone: String
    university_id: String
    created_at: String!
    updated_at: String!
  }

  type Query {
    volunteers: [Volunteer!]!
    volunteer(id: ID!): Volunteer
  }

  input CreateVolunteerInput {
    first_name: String!
    last_name: String!
    email: String!
    volunteer_status: VolunteerStatus!
    phone: String
    university_id: String
  }

  input UpdateVolunteerInput {
    first_name: String
    last_name: String
    email: String
    volunteer_status: VolunteerStatus
    phone: String
    university_id: String
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
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          { code: 'NOT_FOUND' }
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
export * from './chapter.validator';
export * from './volunteer.validator'; // Add this line
```

**File**: `src/core/services/index.ts`
```typescript
export * from './chapter.service';
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
    phone
    created_at
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
    volunteer_status
    created_at
  }
}

# Variables:
{
  "input": {
    "first_name": "Alice",
    "last_name": "Johnson", 
    "email": "alice.johnson@example.com",
    "volunteer_status": "STUDENT"
  }
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
  "errors": [
    {
      "message": "Volunteer not found",
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ],
  "data": {
    "volunteer": null
  }
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