# Styling Guidelines to Follow

### Commits Messages

Let's follow Conventional Commits: <https://www.conventionalcommits.org/en/v1.0.0/>

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

- Make sure to order the scripts alphabetically (A - Z)

### Prettier

Run to format

```
npx prettier . --write
```

Check if all files follow Prettier format

```
npx prettier . --check
```
