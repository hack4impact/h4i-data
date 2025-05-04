# Backend Test Repository

This is a repository for setting up the Prisma ORM, tests, and database.

---
## 🛠 Technology Used

- **Express** — Javascript backend framework
- **PostgreSQL** — Relational Database (Supabase is our hosting service - for the .env info ask Sophia, Harsh, or Josh for it!)
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

---
## Run index.js
```bash
node index.js
```

---
## Run Tests
```bash 
npm test 
```
---