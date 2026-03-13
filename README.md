# Operations API

A comprehensive backend API for managing H4I operations data — volunteers, chapters, projects, partners, and more — with both REST and GraphQL endpoints.

---

## Technology Stack

- **Language** - TypeScript
- **Framework** - Express.js
- **Database** - PostgreSQL (Railway in production, Docker locally)
- **ORM** - Prisma 7+ (with `@prisma/adapter-pg`)
- **API Types** - REST & GraphQL
- **Testing** - Jest & Supertest
- **Code Quality** - ESLint, Prettier, Husky
- **CI/CD** - GitHub Actions

---

## Project Structure

```
src/
├── api/
│   ├── rest/       # REST API endpoints
│   └── graphql/    # GraphQL schema and resolvers
├── core/
│   ├── services/   # Business logic
│   └── validators/ # Input validation
├── config/         # Database and server configuration
├── middleware/      # Logging, security, and errors
└── app.ts          # Main application entry point

tests/
├── unit/           # Unit tests (no database required)
└── integration/    # Integration tests (requires Docker)

prisma/
└── schema.prisma   # Database schema
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
DATABASE_URL="postgresql://user:password@host:5432/dbname"
PORT=3001
REST_PORT=3002
GRAPHQL_PORT=3003
NODE_ENV=development
```

### 3. Start Development Server

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

## Deployment

The API is hosted on [Railway](https://railway.app) with a Railway-managed PostgreSQL database.

### How it works

- Pushes to `main` trigger the CI pipeline (lint → unit tests → integration tests → deploy)
- Railway builds with `pnpm build`, runs `prisma migrate deploy` as a pre-deploy step, then starts with `node dist/app.js`
- Railway automatically injects `DATABASE_URL` from the Postgres plugin

### Environment variables

Set the following in the Railway project dashboard:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | auto-injected by Railway Postgres plugin |

### Health check

The API exposes `GET /health` which Railway uses to verify the service is running after each deploy.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, testing, and contribution guidelines.

---

## Useful Resources

- [Prisma Client CRUD Operations](https://www.prisma.io/docs/orm/prisma-client/queries/crud)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
