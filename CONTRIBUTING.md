# Contributing

Here are all of the steps you should follow whenever contributing to this repo!

---

## Quick Start

### 1. Setting Up the Repo

1. Go to the project [repo](https://github.com/hack4impact/operations-api).
2. Click the green "Code" button in the top right. Switch to the "HTTPS" tab.
3. If you are using Github Desktop, click "Open with Github Desktop", otherwise click the "Copy URL to clipboard" button to the right of the URL.
4. Go into your IDE/terminal and enter `git clone <paste-URL-here>`

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Copy `.env.example` to `.env` and fill in the values (credentials available in Vaultwarden):

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

### 4. Database Setup

```bash
pnpm exec prisma migrate dev    # Apply migrations and generate Prisma client
```

### 5. Start Development Server

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

### Unit Tests

Unit tests mock the database and run without any external dependencies.

```bash
pnpm run test:unit          # Run unit tests
pnpm run test:watch         # Watch mode
pnpm run test:coverage      # Generate coverage report
```

### Integration Tests

Integration tests run against a real local PostgreSQL database in Docker. **Docker Desktop must be installed and running** before running integration tests.

#### Docker Setup

A PostgreSQL 16 container runs on port **5433**, separate from any local Postgres you may have on 5432. It is seeded automatically from `db-init/seed.sql` on startup.

```bash
pnpm run docker:up          # Start the test database container
pnpm run docker:down        # Stop and remove the container (with volumes)
pnpm run seed:test          # Re-run seed.sql against the running container
```

#### Running Integration Tests

```bash
pnpm run test:integration   # Starts Docker, runs tests, stops Docker
```

The test script handles starting and stopping the container automatically. If you want to keep the container running between runs (faster for development), start it manually first:

```bash
pnpm run docker:up
pnpm exec cross-env NODE_ENV=test jest tests/integration --runInBand
```

#### Inspecting the Test Database

To inspect the database manually while tests are running or after a failure:

```bash
docker compose exec -T test-db psql -U postgres -d test_db
# Useful psql commands:
# \dt              — list tables
# SELECT * FROM volunteers;
```

**Tip:** To pause a test mid-run so you can inspect the database state, insert `await new Promise(() => {});` at the point you want to pause.

### Run All Tests

```bash
pnpm run test               # Unit tests, then integration tests (requires Docker)
```

### Testing Best Practices

- Mock the database before importing modules in unit tests
- Use `describe()` blocks to organize related tests
- Write async test functions
- Follow the AAA pattern: Arrange, Act, Assert
- **Integration tests must be completely self-contained** — each test creates its own data and does not depend on other tests or seed data

---

## Development Guidelines

_See Style Guide: [STYLE_GUIDE.md](https://github.com/hack4impact/operations-api/blob/main/STYLE_GUIDE.md)_

### Database Management

- Edit `schema.prisma` directly to make schema changes
- After changing `schema.prisma`, run `pnpm exec prisma migrate dev --name <description>` to create a migration and regenerate the Prisma client
- Migrations are applied automatically on production deploy via `prisma migrate deploy`

### Branch Naming Convention

Follow the pattern listed in your issue: `feature/issue-number-description`

- Example: `feature/1-add-volunteer-endpoints`
- This automatically links branches to GitHub issues
- Create your branch off of the `develop` branch, not `main`

### Making Changes

1. Make sure you're on the `develop` branch and up to date: `git checkout develop && git pull && pnpm install`
2. Create a branch off of `develop`: `git checkout -b <name-of-branch>`
3. Make changes to the code
4. Run ESLint to ensure code standards (see in [style guide](https://github.com/hack4impact/operations-api/blob/main/STYLE_GUIDE.md#eslint)).

### Committing Changes

When interacting with Git/GitHub, feel free to use the command line, VSCode extension, or Github desktop. These steps assume you have already made a branch using `git checkout -b <branch-name>` and you have made all necessary code changes for the provided task.

1. View diffs of each file you changed using the VSCode Github extension (3rd icon on far left bar of VSCode) or GitHub Desktop
2. `git add .` (to stage all files) or `git add <file-name>` (to stage specific file)
3. `git commit -m "<type>[optional scope]: <description>"` or `git commit -m "<type>[optional scope]: <description>" -m "[optional body]"` or `git commit` to get a message prompt
4. `git push -u origin <name-of-branch>`

### Making Pull Requests

1. Go to the Pull Requests tab on [github.com](https://github.com/)
2. Find your PR, fill out the PR template
3. (If applicable, provide a screenshot of your work in the comment area)
4. Link your PR to the corresponding Issue
5. Request a reviewer to check your code
6. Once approved, your code is ready to be merged in 🎉

---

## Adding New Endpoints

### 1. Service Layer (`src/core/services/`)

- Create business logic functions using async/await
- Services throw custom errors (`NotFoundError`, `DatabaseError`) — the error middleware handles them automatically
- Use function declarations, not arrow functions
- Follow existing naming conventions and export from `src/core/services/index.ts`

### 2. GraphQL (`src/api/graphql/`)

- Add schema definitions in `schemas/`
- Implement resolvers in `resolvers/`
- Export from the respective index files
- Register in `graphql/schemas.ts` and `graphql/resolvers.ts`

### 3. REST (`src/api/rest/`)

- Add a controller in `controllers/`
- Define routes in `routes/`
- Export from the respective index files
- Apply Zod validation from `core/validators`
- Register the route in `rest/routes.ts`
