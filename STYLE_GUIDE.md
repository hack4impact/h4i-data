# Styling Guidelines

### Recommended IDE - Visual Studio Code

### Commits Messages

Let's follow Conventional Commits when writing our commit messages: <https://www.conventionalcommits.org/en/v1.0.0/>

Structure:

<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

Example: feature(core): add submit functionality in Button.tsx

### ESLint

Run before committing:

```
npx eslint .
```

To fix automatic errors:

```
npx eslint --fix .
```

### Unused Dependencies

Run to check for unused dependencies

```
npx depcheck
```

Uninstall unused dependencies with

```
npm uninstall <dependency-name>
```

### package.json

Make sure to order the scripts alphabetically (A - Z)

### Prettier

Run to format

```
npx prettier . --write
```

Check if all files follow Prettier format

```
npx prettier . --check
```

## Writing Code

- Use function declarations - not arrow functions

### Best Practices to Write REST API

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
