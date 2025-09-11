# REST API Development Examples & TDD Flow

This guide demonstrates how to create REST endpoints using Test-Driven Development (TDD) in this project.

---

## TDD Flow for REST APIs

### 1. Test-First Development Cycle
1. **Red**: Write failing integration and unit tests
2. **Green**: Implement minimal code to pass tests
3. **Refactor**: Improve code while maintaining green tests

### 2. REST Testing Strategy
- **Controller Tests**: Test request/response handling and validation
- **Integration Tests**: `tests/integration/rest/` - Full HTTP request/response testing
- **Unit Tests**: `tests/unit/services/` - Business logic testing

---

## Example: Adding a New REST Endpoint (Volunteer)

Let's create volunteer endpoints using TDD methodology.

### Step 1: Write Failing Integration Tests (RED)

**File**: `tests/integration/rest/volunteer.test.ts`

```typescript
describe('POST /volunteers', () => {
  // describe what you want to test
  it('should create a new volunteer', async () => {
    // define data
    const volunteerData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      graduation_date: new Date('2026-06-18').toISOString(),
      volunteer_status: 'STUDENT',
      volunteer_type: 'BOTH',
      university_id: '07608837-420f-4697-bda2-701506079a9d', // Test UUID from Supabase
    };

    // make a request to the server with data if needed
    const response = await request(server)
      .post('/volunteers')
      .send(volunteerData);

    // verify the responses
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('volunteer_id');
    expect(response.body.first_name).toBe('John');
    expect(response.body.last_name).toBe('Doe');
    expect(response.body.email).toBe('john.doe@example.com');
    expect(response.body.volunteer_status).toBe('STUDENT');

    createdVolunteerId = response.body.volunteer_id;
  });
})

```
### Step 1: Run tests (they will fail) (RED)

```bash
npm run test:integration
```

### Step 3: Create Validator (GREEN)

**File**: `src/core/validators/volunteers.validator.ts`

```typescript
import { z } from 'zod';

export const createVolunteerSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.email('Must be a valid email address'),
  graduation_date: z.date().isodate(),
  volunteer_status: z.enum(['STUDENT', 'PROFESSIONAL']),
  h4i_email: z.email('Must be a valid H4I email address').optional(),
  volunteer_type: z.enum(['CHAPTER', 'BOTH', 'NATIONALS']),
  university_id: z.uuid(),
  chapter_id: z.uuid().optional(),
  company_id: z.uuid().optional(),
});

export const updateVolunteerSchema = createVolunteerSchema.partial();
```

**File**: `src/core/validators/index.ts`

```typescript
export * from './volunteers.validator';
```

### Step 4: Create Service Layer (GREEN)

**File**: `src/core/services/volunteer.service.ts`

```typescript
// create the actual service that will connect to the database and update/create data
export const createVolunteer = async (data: CreateVolunteerInput) => {
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
};
```

**File**: `src/core/services/index.ts`

```typescript
export * from './volunteer.service';
```

### Step 5: Create Controller (GREEN)

**File**: `src/api/rest/controllers/volunteer.controller.ts`

```typescript
export const volunteerController = {
  createVolunteer: asyncHandler(async (req: RequestWithId, res: Response) => {
      // Validate input data
      const validatedData = createVolunteerSchema.parse(req.body);

      logger.info('Creating volunteer via REST API', {
        requestId: req.requestId,
        volunteerData: validatedData,
      });

      const newVolunteer = await createVolunteer(validatedData);
      res.status(201).json(newVolunteer);
    }),
}
```

**File**: `src/api/rest/controllers/index.ts`

```typescript
export * from './volunteers.controller';
```

### Step 6: Create Routes (GREEN)

**File**: `src/api/rest/routes/volunteer.routes.ts`

```typescript
import { Router } from 'express';
import { volunteerController } from '../controllers/volunteers.controller';

const router = Router();

router.get('/', volunteerController.getAllVolunteers);
router.post('/', volunteerController.createVolunteer);
router.get('/:id', volunteerController.getVolunteerById);
router.patch('/:id', volunteerController.updateVolunteer);
router.delete('/:id', volunteerController.deleteVolunteer);

export const volunteerRoutes = router;
```

**File**: `src/api/rest/routes/index.ts`

```typescript
export * from './volunteers.route';
```

### Step 7: Add Wire Routes into Main Server (GREEN)

**File**: `src/api/rest/routes.ts`

```typescript
import { volunteerRoutes } from './volunteer.routes';
router.use('/volunteers', volunteerRoutes);
```

### Step 8: Run All Tests (GREEN)

```bash
npm run test
```

### Step 10: Refactor & Add Improvements (REFACTOR)

Refer to `src/middleware/error.middleware.ts` for what you can use

---

## REST API Examples & Testing

### Manual Testing with cURL

```bash
# Create a volunteer
curl -X POST http://localhost:3002/api/rest/volunteers \
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