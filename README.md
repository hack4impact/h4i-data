# Volunteer Management Backend!

A comprehensive backend API for managing volunteers, chapters, nonprofits, projects, and sponsors with both REST and GraphQL endpoints.

---

## Technology Stack

- **Language** - TypeScript
- **Framework** - Express.js
- **Database** - PostgreSQL (hosted on Supabase)
- **ORM** - Prisma
- **API Types** - REST & GraphQL
- **Testing** - Jest & Supertest
- **Code Quality** - ESLint, Prettier, Husky
- **CI/CD** - GitHub Actions

---

## Project Structure

```markdown
src/
├── api/
│ ├── rest/ # REST API endpoints
│ └── graphql/ # GraphQL schema and resolvers
├── core/
│ ├── services/ # Business logic
│ └── validators/ # Input validation
├── config/ # Database and server configuration
├── middleware/ # Logging, security, and errors
└── app.ts # Main application entry point

tests/
├── unit/ # Unit tests
└── integration/ # Integration tests

prisma/
├── schema.prisma # Database schema
└── migrations/ # Database migrations
```

---

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

Create a `.env` file in the root directory and copy fields from `.env.example`:

```env
# Database Configuration
DATABASE_URL=your_database_url_here
DIRECT_URL=your_direct_url_here

# Server Configuration
PORT=3000
REST_PORT=3001
GRAPHQL_PORT=3002
```

### 3. Database Setup

```bash
npx prisma db pull     # Sync schema with database
npx prisma generate    # Generate Prisma client
```

### 4. Start Development Server

```bash
# Start integrated server (both REST & GraphQL)
pnpm run dev

# Or start servers separately
pnpm run dev:rest       # REST API only
pnpm run dev:graphql    # GraphQL API only
pnpm run dev:both       # Both servers concurrently
```

The servers will be available at:

- **Integrated**: <http://localhost:3001>
- **REST API**: <http://localhost:3002>
- **GraphQL API**: <http://localhost:3003>

---

## Testing

```bash
pnpm run test               # Run all tests (Unit &  Integration)
pnpm run test:coverage      # Generate coverage report for Unit tests only
pnpm run test:integration   # Integration tests only
pnpm run test:unit          # Unit tests only
pnpm run test:watch         # Watch mode for unit tests
```

---

## Database Schema

The database includes the following main entities:

- **chapters** - Local H4I chapters
- **companies** - Companies associated with volunteers, sponsors, & nonprofits
- **contacts** - Contact information
- **locations** - Geographic locations
- **operations_branches** - H4I Branches of the Operations Board
- **nonprofits** - Partner nonprofit organizations
- **roles** - All existing roles within the organization
- **projects** - Development projects for nonprofits
- **sponsors** - Corporate sponsors
- **volunteers** - Student and professional volunteers

The database includes the following main relationship tables:

- **nonprofit_chapter_project**
- **sponsor_chapter**
- **volunteer_assignment**
- **volunteer_history**
- **volunteer_role_project**

---

## Development Guidelines

### Database Management

- **DO NOT** edit `schema.prisma` directly in production
- Use Supabase Table Editor for schema changes in production
- Always run `npx prisma db pull` and `npx prisma generate` after database changes
- This ensures code stays synchronized with the database

### Branch Naming Convention

Follow the pattern: `feature/issue-number-description`

- Example: `feature/1-add-volunteer-endpoints`
- This automatically links branches to GitHub issues

---

## API Documentation

### GraphQL API

GraphQL endpoint available at `/api/graphql` with interactive playground.

Example mutation:

```graphql
mutation {
  addVolunteer(
    volunteer: {
      first_name: "Jane"
      last_name: "Doe"
      email: "janedoe@example.com"
      graduation_date: "2026-06-18"
      volunteer_status: STUDENT
      H4I_email: "jane@hack4impact.org"
      volunteer_type: CHAPTER
      university_id: "860b69b4-a14e-41d9-a367-2632b342e549"
    }
  )
}
```

More examples available in [`docs/examples/graphql-examples.md`](docs/examples/graphql-examples.md)

### REST API

REST endpoints available at `/api/rest` following RESTful conventions.

See [`docs/api/rest-api.md`](docs/api/rest-api.md) and [`docs/api/graphql-api.md`](docs/api/graphql-api.md) for complete API documentation.

---

## Architecture

### Adding New Endpoints

1. **Service Layer** (`src/core/services/`)
   - Create business logic functions
   - Use async/await pattern
   - Implement proper error handling with try/catch
   - Follow existing naming conventions
   - Use function declarations and not arrow functions

2. **GraphQL** (`src/api/graphql/`)
   - Add schema definitions in `schemas/`
   - Implement resolvers in `resolvers/`
   - Export from respective index files
   - Update `graphql/resolvers.ts` and `graphql/schemas.ts` after schema and resolver implementations

3. **REST** (`src/api/rest/`)
   - Add controllers in `controllers/`
   - Define routes in `routes/`
   - Export from respective index files
   - Apply validation using Zod validators from `core/validators`
   - Add route in `rest/routes.ts`

### Testing Best Practices

- Mock services before importing in tests
- Use `describe()` blocks for organizing related tests
- Write async test functions
- Follow AAA pattern: Arrange, Act, Assert
- **Integration tests should be completely self-contained** - each test creates its own data and doesn't depend on other tests
- Examples available in `tests/` directory

---

## Useful Resources

- [Prisma Client CRUD Operations](https://www.prisma.io/docs/orm/prisma-client/queries/crud)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

## Docker

Command to enter in terminal to access tables:

- docker compose exec -T test-db psql -U postgres -d test_db
- \dt
- SQL commands such as (SELECT * FROM volunteers;)

To pause test, insert this: await new Promise(() => {});

It helps you see when data is created in the local database!