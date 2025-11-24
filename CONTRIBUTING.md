# Contributing

Here are all of the steps you should follow whenever contributing to this repo!

---

## Quick Start

### 1. Setting Up the Repo

1. Go to the project [repo](https://github.com/hack4impact/operations-api).
2. Click the green "Code" button in the top right. Switch to the "HTTPS" tab.
3. Click the "Copy URL to clipboard" button to the right of the URL.
4. Go into your IDE/terminal and enter `git clone <paste-URL-here>`

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

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

### 4. Database Setup

```bash
npx prisma db pull     # Sync schema with database
npx prisma generate    # Generate Prisma client
```

### 5. Start Development Server

```bash
# Start integrated server (both REST & GraphQL)
npm run dev

# Or start servers separately
npm run dev:rest       # REST API only
npm run dev:graphql    # GraphQL API only
npm run dev:both       # Both servers concurrently
```

The servers will be available at:

- **Integrated**: <http://localhost:3001>
- **REST API**: <http://localhost:3002>
- **GraphQL API**: <http://localhost:3003>

---

## Development Guidelines

_See Style Guide: [STYLE_GUIDE.md](https://github.com/hack4impact/operations-api/blob/main/STYLE_GUIDE.md)_

### Branch Naming Convention

Follow the pattern: `feature/issue-number-description`

- Example: `feature/1-add-volunteer-endpoints`
- This automatically links branches to GitHub issues

### Making Changes

1. Before you start making changes, always make sure you're on the main branch, then `git pull` and `npm i` to make sure your code is up to date
2. Create a branch `git checkout -b <name-of-branch>`
3. Make changes to the code
4. Run ESLint to ensure code standards (see in [style guide](https://github.com/hack4impact/operations-api/blob/main/STYLE_GUIDE.md#eslint)).

### Committing Changes

When interacting with Git/GitHub, feel free to use the command line, VSCode extension, or Github desktop. These steps assume you have already made a branch using `git checkout -b <branch-name>` and you have made all neccessary code changes for the provided task.

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

### Testing

```bash
npm run test               # Run all tests (Unit &  Integration)
npm run test:coverage      # Generate coverage report for Unit tests only
npm run test:integration   # Integration tests only
npm run test:unit          # Unit tests only
npm run test:watch         # Watch mode for unit tests
```
