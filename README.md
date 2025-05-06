# Backend Test Repository

This is a repository for setting up the Prisma ORM, tests, and database.

---
## 🛠 Technology Used

- **Language** - Typescript
- **Express** — Javascript backend framework
- **PostgreSQL** — Relational Database (Supabase is our hosting service - for the .env info ask Sophia, Harsh, or Josh for it! To view the databases in Supabase, DM Sophia to get an invitation!)
- **Prisma** - Object Relational Mapping for convenience (with this, we don't have to write raw SQL!)
- **Jest** - Testing Framework, CI

---
## Setup and Run

```bash
npm i
```
---
## Prisma

```bash
npx prisma db pull
npx prisma generate
```

npx prisma db pull - This is to update models in schema.prisma according to the database in Supabase

npx prisma generate - This generates the Prisma Client code based on our schema.prisma (use this whenever you update the schema.prisma)

```bash
npx prisma migrate dev
```

Run this whenever you make changes to the schema.prisma

---
## Run index.ts
```bash
npx ts-node index.ts
```

---
## Rules When Creating Branches

1. Please make sure to name your branch with your name (ex. JaneDoe)

---
## Run Tests
```bash 
npm test 
```
---

## Helpful Links

1. Prisma: https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases-typescript-postgresql
