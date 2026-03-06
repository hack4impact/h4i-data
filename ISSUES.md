# Code Review Issues

## High (correctness / behavior)

### 1. Double CORS middleware in `app.ts` [DONE]
CORS is applied in `app.ts` (line 14) AND again inside `createRestApp()` and `createGraphqlApp()`.
When `app.ts` mounts those sub-apps, requests hit CORS twice.
Fix: Remove the redundant `app.use(cors(corsConfig))` from `app.ts`.

### 2. `getAllowedOrigins()` called on every request in `cors.ts` [DONE]
The function runs — and logs — on every incoming CORS check because it's called inside the
`origin` callback. Allowed origins should be computed once at module load time, not per-request.
Fix: Call `getAllowedOrigins()` at module scope and store the result.

### 3. `req.connection.remoteAddress` is deprecated [DONE]
`req.connection` was deprecated in Node.js v13.
Fix: Replace with `req.socket.remoteAddress` in:
- `src/middleware/logging.middleware.ts:34`
- `src/middleware/error.middleware.ts:111`

---

## Medium (DRY / consistency)

### 4. `RequestWithId` duplicated in 21 files [DONE]
Defined locally in every controller, `logging.middleware.ts`, and `error.middleware.ts`.
Fix: Export it from `error.middleware.ts` and import it everywhere else.

### 5. Double validation in `officer-roles.service.ts` [DONE]
`createOfficerRole` and `updateOfficerRole` call `.parse()` on already-typed input.
No other service does this.
Fix: Remove the redundant `.parse()` calls and pass `data` directly.

### 6. `app.ts` uses `console.log` instead of `logger` [DONE]
Startup and shutdown messages use raw `console.log` while the rest of the codebase uses winston.
Fix: Import and use `logger` from `src/config/logger.ts`.

### 7. Redundant port resolution in `app.ts` [DONE]
`const port = process.env.PORT || env.PORT || 3001` — `env.PORT` already reads from
`process.env.PORT` with a default of 3001 via Zod. The full expression is triple-redundant.
Fix: Use `env.PORT` directly.

---

## Minor (style / cleanup)

### 8. `import fs` at the bottom of `logger.ts` [DONE]
The `import fs from 'fs'` statement is on line 107, after executable code.
Fix: Move it to the top of the file with the other imports.

### 9. Unnecessary conditional spread in `resolvers.ts` [DONE]
`...(volunteerResolvers.Volunteer && { Volunteer: ... })` — the property is always defined.
Fix: Replace with direct assignment for both `Volunteer` and `Mentor` type resolvers.

### 10. Unnecessary `as string` casts in controllers [N/A — cast is required by Express types in this project]
`req.params.id as string` — Express types `req.params` as `Record<string, string>`, so the
cast is redundant. Affects all 19 controllers.
Fix: Remove the casts.

### 11. Dynamic `require('./logger')` in `database.ts` [DONE]
Used to avoid a supposed circular dependency that does not actually exist.
Both `database.ts` and `logger.ts` import from `server.ts` but do not import each other.
Fix: Replace with a static `import { logger } from './logger'`.
