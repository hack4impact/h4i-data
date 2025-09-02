# REST API Development Examples & TDD Flow

This guide demonstrates how to create REST endpoints using Test-Driven Development (TDD) in this project.

---

## TDD Flow for REST APIs

### 1. Test-First Development Cycle
1. **Red**: Write failing integration and unit tests
2. **Green**: Implement minimal code to pass tests
3. **Refactor**: Improve code while maintaining green tests

### 2. REST Testing Strategy
- **Integration Tests**: `tests/integration/rest/` - Full HTTP request/response testing
- **Unit Tests**: `tests/unit/services/` - Business logic testing
- **Controller Tests**: Test request/response handling and validation

---

## Example: Adding a New REST Endpoint (Volunteer)

Let's create volunteer endpoints using TDD methodology.

### Step 1: Write Failing Integration Tests (RED)

**File**: `tests/integration/rest/volunteer.test.ts`

```typescript
import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createRestApp } from '../../../src/api/rest/server';
import { disconnectDB, prisma } from '../../../src/config/database';
import { env } from '../../../src/config/server';

let server: Server;
let app: express.Application;
let createdVolunteerId: string;

beforeAll(() => {
  app = createRestApp();
  server = app.listen(env.REST_PORT);
});

afterAll(async () => {
  if (createdVolunteerId) {
    await prisma.volunteers.delete({ where: { volunteer_id: createdVolunteerId } });
  }
  server.close();
  await disconnectDB();
});

describe('REST API - /volunteers', () => {
  describe('POST /volunteers', () => {
    it('should create a new volunteer', async () => {
      const volunteerData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        volunteer_status: 'STUDENT'
      };

      const response = await request(server)
        .post('/volunteers')
        .send(volunteerData);

      // This will fail initially - RED phase
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('volunteer_id');
      expect(response.body.first_name).toBe('John');
      expect(response.body.last_name).toBe('Doe');
      expect(response.body.email).toBe('john.doe@example.com');
      expect(response.body.volunteer_status).toBe('STUDENT');

      createdVolunteerId = response.body.volunteer_id;
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        first_name: 'A', // Too short
        email: 'invalid-email', // Invalid format
      };

      const response = await request(server)
        .post('/volunteers')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /volunteers', () => {
    it('should fetch all volunteers', async () => {
      const response = await request(server)
        .get('/volunteers');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /volunteers/:id', () => {
    it('should fetch a volunteer by ID', async () => {
      expect(createdVolunteerId).toBeDefined();

      const response = await request(server)
        .get(`/volunteers/${createdVolunteerId}`);

      expect(response.status).toBe(200);
      expect(response.body.volunteer_id).toBe(createdVolunteerId);
      expect(response.body.first_name).toBe('John');
    });

    it('should return 404 for non-existent volunteer', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(server)
        .get(`/volunteers/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('PATCH /volunteers/:id', () => {
    it('should update a volunteer', async () => {
      expect(createdVolunteerId).toBeDefined();

      const updateData = {
        first_name: 'Jane',
        volunteer_status: 'PROFESSIONAL'
      };

      const response = await request(server)
        .patch(`/volunteers/${createdVolunteerId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.first_name).toBe('Jane');
      expect(response.body.volunteer_status).toBe('PROFESSIONAL');
      expect(response.body.last_name).toBe('Doe'); // Unchanged
    });
  });

  describe('DELETE /volunteers/:id', () => {
    it('should delete a volunteer', async () => {
      expect(createdVolunteerId).toBeDefined();

      const response = await request(server)
        .delete(`/volunteers/${createdVolunteerId}`);

      expect(response.status).toBe(204);

      // Verify deletion
      const getResponse = await request(server)
        .get(`/volunteers/${createdVolunteerId}`);
      
      expect(getResponse.status).toBe(404);
      
      // Prevent cleanup attempt
      createdVolunteerId = '';
    });
  });
});
```

**Run tests** (they will fail):
```bash
npm run test:integration
```

### Step 2: Write Unit Tests for Controller (RED)

**File**: `tests/unit/controllers/volunteer.controller.test.ts`

```typescript
import { Request, Response } from 'express';
import { volunteerController } from '../../../src/api/rest/controllers/volunteer.controller';
import * as volunteerService from '../../../src/core/services/volunteer.service';

// Mock the service layer
jest.mock('../../../src/core/services/volunteer.service');

describe('Volunteer Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson, send: jest.fn() });
    mockSend = jest.fn();

    mockResponse = {
      json: mockJson,
      status: mockStatus,
      send: mockSend,
    };

    jest.clearAllMocks();
  });

  describe('createVolunteer', () => {
    it('should create a volunteer and return 201', async () => {
      const volunteerData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        volunteer_status: 'STUDENT' as const,
      };

      const createdVolunteer = {
        volunteer_id: '123',
        ...volunteerData,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRequest = {
        body: volunteerData,
      };

      (volunteerService.createVolunteer as jest.Mock).mockResolvedValue(createdVolunteer);

      await volunteerController.createVolunteer(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(createdVolunteer);
    });

    it('should return 400 for validation error', async () => {
      const invalidData = { first_name: 'A' }; // Too short

      mockRequest = {
        body: invalidData,
      };

      // Mock validation error
      const validationError = new Error('Validation failed');
      (volunteerService.createVolunteer as jest.Mock).mockRejectedValue(validationError);

      await volunteerController.createVolunteer(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
    });
  });

  describe('getAllVolunteers', () => {
    it('should return all volunteers', async () => {
      const volunteers = [
        { volunteer_id: '1', first_name: 'John', last_name: 'Doe' },
        { volunteer_id: '2', first_name: 'Jane', last_name: 'Smith' },
      ];

      mockRequest = {};

      (volunteerService.getAllVolunteers as jest.Mock).mockResolvedValue(volunteers);

      await volunteerController.getAllVolunteers(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith(volunteers);
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

export const getAllVolunteers = async () => {
  try {
    return await prisma.volunteers.findMany();
  } catch (error) {
    throw new Error('Failed to fetch volunteers');
  }
};

export const getVolunteerById = async (id: string) => {
  try {
    return await prisma.volunteers.findUnique({ 
      where: { volunteer_id: id } 
    });
  } catch (error) {
    throw new Error('Failed to fetch volunteer');
  }
};

export const createVolunteer = async (data: CreateVolunteerInput) => {
  try {
    return await prisma.volunteers.create({ data });
  } catch (error) {
    throw new Error('Failed to create volunteer');
  }
};

export const updateVolunteer = async (id: string, data: UpdateVolunteerInput) => {
  try {
    return await prisma.volunteers.update({ 
      where: { volunteer_id: id }, 
      data 
    });
  } catch (error) {
    throw new Error('Failed to update volunteer');
  }
};

export const deleteVolunteer = async (id: string) => {
  try {
    return await prisma.volunteers.delete({ 
      where: { volunteer_id: id } 
    });
  } catch (error) {
    throw new Error('Failed to delete volunteer');
  }
};
```

### Step 5: Create Controller (GREEN)

**File**: `src/api/rest/controllers/volunteer.controller.ts`

```typescript
import { Request, Response } from 'express';
import {
  getAllVolunteers,
  getVolunteerById,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  createVolunteerSchema,
  updateVolunteerSchema,
} from '../../../core';

export const volunteerController = {
  getAllVolunteers: async (_req: Request, res: Response) => {
    try {
      const volunteers = await getAllVolunteers();
      res.json(volunteers);
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to retrieve volunteers',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getVolunteerById: async (req: Request, res: Response) => {
    try {
      const volunteer = await getVolunteerById(req.params.id);
      if (volunteer) {
        res.json(volunteer);
      } else {
        res.status(404).json({ error: 'Volunteer not found' });
      }
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to retrieve volunteer',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  createVolunteer: async (req: Request, res: Response) => {
    try {
      const validatedData = createVolunteerSchema.parse(req.body);
      const newVolunteer = await createVolunteer(validatedData);
      res.status(201).json(newVolunteer);
    } catch (error) {
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({ 
          error: 'Invalid data', 
          details: error.message 
        });
      } else {
        res.status(500).json({ 
          error: 'Failed to create volunteer',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  },

  updateVolunteer: async (req: Request, res: Response) => {
    try {
      const validatedData = updateVolunteerSchema.parse(req.body);
      const updatedVolunteer = await updateVolunteer(req.params.id, validatedData);
      res.json(updatedVolunteer);
    } catch (error) {
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({ 
          error: 'Invalid data', 
          details: error.message 
        });
      } else if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: 'Volunteer not found' });
      } else {
        res.status(500).json({ 
          error: 'Failed to update volunteer',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  },

  deleteVolunteer: async (req: Request, res: Response) => {
    try {
      await deleteVolunteer(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: 'Volunteer not found' });
      } else {
        res.status(500).json({ 
          error: 'Failed to delete volunteer',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  },
};
```

### Step 6: Create Routes (GREEN)

**File**: `src/api/rest/routes/volunteer.routes.ts`

```typescript
import { Router } from 'express';
import { volunteerController } from '../controllers/volunteer.controller';

const router = Router();

router.get('/', volunteerController.getAllVolunteers);
router.post('/', volunteerController.createVolunteer);
router.get('/:id', volunteerController.getVolunteerById);
router.patch('/:id', volunteerController.updateVolunteer);
router.delete('/:id', volunteerController.deleteVolunteer);

export const volunteerRoutes = router;
```

### Step 7: Wire Routes into Main Server (GREEN)

**File**: `src/api/rest/routes/index.ts`

```typescript
import { Router } from 'express';
import { chapterRoutes } from './chapter.routes';
import { volunteerRoutes } from './volunteer.routes'; // Add this

const router = Router();

router.use('/chapters', chapterRoutes);
router.use('/volunteers', volunteerRoutes); // Add this

export default router;
```

### Step 8: Update Exports (GREEN)

**File**: `src/core/index.ts`
```typescript
// Services
export * from './services/chapter.service';
export * from './services/volunteer.service'; // Add this

// Validators  
export * from './validators/chapter.validator';
export * from './validators/volunteer.validator'; // Add this
```

### Step 9: Run Tests (GREEN)

```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run all tests
npm test
```

### Step 10: Refactor (REFACTOR)

Now that tests are passing, consider improvements:

1. **Error Handling Middleware**:
```typescript
// src/api/rest/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.message
    });
  }

  if (error.message.includes('not found')) {
    return res.status(404).json({
      error: 'Resource not found'
    });
  }

  res.status(500).json({
    error: 'Internal server error'
  });
};
```

2. **Request Validation Middleware**:
```typescript
// src/api/rest/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        error: 'Validation failed',
        details: error
      });
    }
  };
};
```

---

## REST API Examples & Testing

### Manual Testing with cURL

```bash
# Create a volunteer
curl -X POST http://localhost:3000/api/rest/volunteers \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Alice",
    "last_name": "Johnson",
    "email": "alice@example.com",
    "volunteer_status": "STUDENT"
  }'

# Get all volunteers
curl -X GET http://localhost:3000/api/rest/volunteers

# Get specific volunteer
curl -X GET http://localhost:3000/api/rest/volunteers/[volunteer-id]

# Update volunteer
curl -X PATCH http://localhost:3000/api/rest/volunteers/[volunteer-id] \
  -H "Content-Type: application/json" \
  -d '{
    "volunteer_status": "PROFESSIONAL"
  }'

# Delete volunteer
curl -X DELETE http://localhost:3000/api/rest/volunteers/[volunteer-id]
```

### Testing with Postman

1. **Create Collection**: "Volunteer Management API"

2. **Environment Variables**:
```json
{
  "baseUrl": "http://localhost:3000/api/rest",
  "volunteerId": "{{volunteer_id}}"
}
```

3. **Test Scripts** (in Postman Tests tab):
```javascript
// For POST /volunteers
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has volunteer_id", function () {
    pm.expect(pm.response.json()).to.have.property('volunteer_id');
});

pm.test("Store volunteer ID", function () {
    const responseJson = pm.response.json();
    pm.environment.set("volunteer_id", responseJson.volunteer_id);
});
```

### Integration with GitHub Actions

**File**: `.github/workflows/test.yml`

```yaml
name: Test API

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: password
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://postgres:password@localhost:5432/test_db
```

---

## Best Practices Summary

### 1. Test Structure
- **Integration tests** verify full request/response cycle
- **Unit tests** test business logic in isolation
- **Clean up data** in test teardown
- **Use descriptive test names** that explain behavior

### 2. Error Handling
- **Return appropriate HTTP status codes**
- **Include error details** for debugging
- **Log errors** for monitoring
- **Handle validation errors** separately from server errors

### 3. Code Organization
- **Separation of concerns**: Controller → Service → Database
- **Input validation** at controller level
- **Business logic** in service layer
- **Consistent error responses** across endpoints

### 4. Development Workflow
- **Write tests first** (TDD)
- **Run tests frequently** during development
- **Use hot reloading** for fast feedback
- **Implement CI/CD** for automated testing