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

### Naming Conventions

- Use **camelCase** (e.g. firstName, lastName) for variables, functions, class members, and type members.
- Use **UPPER_CASE** (e.g. FIRST_NAME, LAST_NAME) with underscores between words for constants/globals
- Use **PascalCase** (e.g. FirstName, LastName) for class, interface, enum, and type names; enum members should also be in PascalCase; exported components should also be in PascalCase.
- Boolean variables should be prefixed with a verb (e.g. isEnabled)
- Use **camelCase** for file names _unless_ the file exports a component, in which case use **PascalCase**

### Variables

- Use the `const` keyword for constant variables
- Use the `let` keyword for local variables. `let` has scoping restrictions, `var`, does not.
- Do NOT use the `var` keyword for variables
- Use meaningful variable names. Better to have longer, useful names than shorter, confusing ones.
- Do not use a variable if it will only be used once.
- Booleans: don't use negative names for boolean variables (BAD: `const isNotEnabled = true`, GOOD: `const isEnabled = true`)

### Commenting

#### When to add Comments

- Include comments for intricate or non-obvious code segments
- Clarify how your code handles edge cases or exceptional scenarios
- Document workarounds due to limitations or external dependencies
- Mark areas where improvements or additional features are needed. Link to GitHub Issue, if possible.

#### When NOT to add Comments

- Avoid redundant comments that merely repeat what the code already expresses clearly.
- If the code’s purpose is evident (e.g., simple variable assignments), skip unnecessary comments.
- Remove temporary comments used for debugging once the issue is resolved.
- Incorrect comments can mislead other developers, so ensure accuracy.

#### TODO Comments

In general, TODO comments are a big risk. We may see something that we want to do later so we drop a quick `// TODO: Replace this method` thinking we'll come back to it but never do.

If you're going to write a TODO comment, **link to the GitHub Issues board**.

There are valid use cases for a TODO comment. For example, you may be working on a big feature and you want to make a pull request that only fixes part of it. Or, you may want to call out some refactoring that still needs to be done, but that you'll fix in another PR.

```
// TODO: Refactor this class. Issue #123
```

This is actionable because it forces us to go to our issue tracker and create a ticket. That is less likely to get lost.

### Writing Tests

See the test templates for writing tests in `/docs/examples/`

- [GraphQL Template](https://github.com/hack4impact/operations-api/blob/main/docs/examples/graphql-examples.md)
- [REST Template](https://github.com/hack4impact/operations-api/blob/main/docs/examples/rest-examples.md)

### Writing Queries

#### Filtering/Sorting

Use the following structure for writing queries with filters and sorts. Note: you **MUST** name the variables **"filter"** and **"sort"**, nothing else.

Example query using filter and sort:

```
query {
  volunteers(
    filter: {
      statuses: ["PROFESSIONAL", "STUDENT"],
      roles: ["Developer"],
      chapters: ["Cal high"]
    },
    sort: {
      firstName: ascending
    }
  ) {
    volunteer_id
    first_name
  }
}
```

### Code Organization

#### General Structure

Our code should follow the structure below, from top to bottom:

1. Imports are first at the top of the file. Only include used imports, and they should be grouped appropriately (see _Organize Imports_ for more).
2. Constant variable declarations should follow after the imports and before any class definitions.
3. Type declarations follow constants (e.g. `type CreateChatperInputs`).
4. Enum declarations.
5. Interface definitions should be next (e.g. `NonprofitsQueryArgs`).
6. Core logic/component definition should be next (e.g. `export const className`). This includes the core class, function, component that the file primarily exports.
7. Helper functions/methods. Define event handlers, utility functions, or methods used internally by the main logic.
8. Export should be last. Explicitly export the primary functionality along with additional exports at the bottom.

#### Organize Imports

- With clean and easy to read import statements you can quickly see the dependencies of current code. Make sure you apply following good practices for import statements.
- Unused imports should be removed.
- Groups of imports are delineated by one blank line before and after.

### Use TypeScript Aliases

This will avoid long relative paths when doing imports.

Bad:

```
import { UserService } from '../../../services/UserService';
```

Good:

```
import { UserService } from '@services/UserService';
```

## Pull Request Instructions

- Set base branch to "develop"
- Follow the PR template
- Link your issue so it the first line reads "Closes #{ISSUE NUMBER}" (replace curly braces with number)
- Describe your changes and the ticket in the **"Overview"** section
- Describe what testing you completed to verify the feature (manual/unit testing) in the **"Testing"** section
- Add screenshots of results in the **"Screenshots"** section
- Complete the checklist by replacing the "[ ]" with "[x]" (or simply checking the boxes after publishing the PR)
- Add any additional notes at the bottom in the **"Notes"** section
- Assign at least 2 reviewers

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
