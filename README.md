# Operations API

A comprehensive backend API for managing H4I operations data — volunteers, chapters, projects, partners, and more — with both REST and GraphQL endpoints.

---

## Technology Stack

- **Language** - TypeScript
- **Framework** - Express.js
- **Database** - PostgreSQL (Supabase in production, Docker locally)
- **ORM** - Prisma 7+ (with `@prisma/adapter-pg`)
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

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

```env
# Connect to Supabase via connection pooling
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection to the database. Used for migrations
DIRECT_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"

# Server Configuration
PORT=3001
REST_PORT=3002
GRAPHQL_PORT=3003
```

### 3. Database Setup

```bash
pnpm exec prisma db pull     # Sync schema with database
pnpm exec prisma generate    # Generate Prisma client
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
pnpm run test               # Run all tests (unit + integration, auto-starts Docker)
pnpm run test:unit          # Unit tests only (no Docker required)
pnpm run test:integration   # Integration tests only (auto-starts Docker)
pnpm run test:coverage      # Generate coverage report for unit tests only
pnpm run test:watch         # Watch mode for unit tests
```

Integration tests automatically start a Docker PostgreSQL container via `docker compose up -d --wait` before running. Docker Desktop must be installed and running.

---

## Database Schema

The database includes the following core entities:

- **constituents** - People in the system (base identity table)
- **volunteers** - Volunteer profiles (extends constituents)
- **chapters** - Local H4I chapters
- **companies** - Employers and corporate entities
- **locations** - Geographic locations
- **partners** - Partner organizations (nonprofits, NGOs, etc.)
- **projects** - Development projects
- **officer_roles** - Officer/leadership roles (chapter or central scope)
- **project_roles** - Roles within a project team

Supporting entities:

- **universities** - Universities linked to chapters and volunteers
- **academic_terms** - Semesters/quarters at universities
- **social_links** - Social media links for constituents

Relationship/tracking entities:

- **project_engagements** - Links projects to partners, chapters, and terms
- **project_staffing** - Assigns volunteers to project engagements with roles
- **project_deliverables** - Deliverables (repos, designs, docs) for projects
- **officer_assignments** - Assigns volunteers to officer roles at chapters
- **mentorships** - Mentor/mentee relationships between constituents
- **volunteer_history** - Audit trail of volunteer lifecycle events

---

## Development Guidelines

### Database Management

- **DO NOT** edit `schema.prisma` directly in production
- Use Supabase Table Editor for schema changes in production
- Always run `pnpm exec prisma db pull` and `pnpm exec prisma generate` after database changes
- This ensures code stays synchronized with the database

### Branch Naming Convention

Follow the pattern: `feature/issue-number-description`

- Example: `feature/1-add-volunteer-endpoints`
- This automatically links branches to GitHub issues

---

## API Documentation

### GraphQL API

GraphQL endpoint available at:

- **Integrated server** (`pnpm run dev`): `http://localhost:3001/api/graphql`
- **Standalone** (`pnpm run dev:graphql`): `http://localhost:3003/`

Example mutation:

```graphql
mutation {
  createChapter(input: {
    name: "UC Berkeley"
    founded_date: "2020-09-01"
  }) {
    chapter_id
    name
    founded_date
  }
}
```

More examples available in [`docs/examples/graphql-examples.md`](docs/examples/graphql-examples.md)

### REST API

REST endpoints available at:

- **Integrated server** (`pnpm run dev`): `http://localhost:3001/api/rest/{entity}`
- **Standalone** (`pnpm run dev:rest`): `http://localhost:3002/{entity}`

Available REST routes: `/academic-terms`, `/chapters`, `/companies`, `/constituents`, `/locations`, `/mentors`, `/mentorships`, `/officer-assignments`, `/officer-roles`, `/partners`, `/project-deliverables`, `/project-engagements`, `/project-roles`, `/project-staffing`, `/projects`, `/social-links`, `/universities`, `/volunteer-history`, `/volunteers`

See [`docs/api/rest-api.md`](docs/api/rest-api.md) and [`docs/api/graphql-api.md`](docs/api/graphql-api.md) for complete API documentation.

---

## Architecture

### Adding New Endpoints

1. **Service Layer** (`src/core/services/`)
   - Create business logic functions
   - Use async/await pattern
   - Services throw custom errors (NotFoundError, DatabaseError) — handled by error middleware
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

## Docker (Test Database)

A local PostgreSQL 16 container is used for integration tests. It runs on port **5433** and is seeded from `db-init/seed.sql`.

```bash
pnpm run docker:up          # Start the test database container
pnpm run docker:down        # Stop and remove the container (with volumes)
pnpm run seed:test          # Re-run seed.sql against the running container
```

To inspect the database manually:

```bash
docker compose exec -T test-db psql -U postgres -d test_db
# Then run: \dt (list tables), SELECT * FROM volunteers; etc.
```

**Tip:** To pause a test so you can inspect the database mid-run, insert `await new Promise(() => {});` in the test.